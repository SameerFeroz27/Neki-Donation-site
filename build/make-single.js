/* =========================================================
   make-single.js — bundle index.html + styles.css + app.js
   into ONE self-contained file: Neki-prototype.html
   Run:  node build/make-single.js
   ========================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const html = read('index.html');
const css  = read('styles.css');
const js   = read('app.js');

// NB: the replacement must be a function. In a replacement *string* the
// sequence "$$" means a literal "$", which would rewrite the app's
// $$(…) querySelectorAll helper into $(…) and break the whole script.
let out = html
  .replace(
    /<link rel="stylesheet" href="styles\.css" \/>/,
    () => '<style>\n' + css + '\n</style>'
  )
  .replace(
    /<script src="app\.js"><\/script>/,
    () => '<script>\n' + js + '\n</script>'
  );

// safety: no local asset references may survive
const locals = [...out.matchAll(/(?:src|href)="(?!https?:|data:|#)([^"]+)"/g)].map(m => m[1]);
if (locals.length) {
  console.error('FAIL: local references still present ->', locals.join(', '));
  process.exit(1);
}

// safety: the inlined JS must be byte-identical to app.js, and the inline
// CSS to styles.css — a mangled splice must never ship
const inlineJs  = out.match(/<script>\n([\s\S]*?)\n<\/script>/);
const inlineCss = out.match(/<style>\n([\s\S]*?)\n<\/style>/);
if (!inlineJs || inlineJs[1] !== js) {
  console.error('FAIL: inlined JavaScript does not match app.js');
  process.exit(1);
}
if (!inlineCss || inlineCss[1] !== css) {
  console.error('FAIL: inlined CSS does not match styles.css');
  process.exit(1);
}

const dest = path.join(ROOT, 'Neki-prototype.html');
fs.writeFileSync(dest, out, 'utf8');
console.log('wrote', dest);
console.log('size', (out.length / 1024).toFixed(1), 'KB');
console.log('external refs:', (out.match(/https?:\/\/[^"' ]+/g) || []).join('\n  ') || 'none');
