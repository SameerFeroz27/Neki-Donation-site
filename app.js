/* =========================================================
   Neki — prototype logic
   Flow:  amount → method (pic 1) → request (pic 2) | card (pic 3) → done
   ========================================================= */
const CONFIG = {
  currency: 'PKR',
  presets: [500, 1000, 2000, 5000],
  feePercent: 2,
  usdRate: 278.50,
};

/* ---------- campaign category icons: green/gold theme only ----------
   These are sprite ids. The geometry lives in the #i-* symbols in
   index.html, so a card only names the icon it wants and no path data is
   duplicated here. */
const ICONS = {
  health:   'i-health',
  food:     'i-food',
  water:    'i-water',
  education:'i-education',
  emergency:'i-emergency',
  seasonal: 'i-seasonal',
};

const CAMPAIGNS = [
  { id:'heart', tag:'Health', icon:'health',
    title:'Heart surgery for Zainab, 6',
    desc:'A hole in the heart needs urgent repair. The surgery is booked; the family has covered the tests only.',
    raised:620000, goal:850000, days:11 },
  { id:'ration', tag:'Food', icon:'food',
    title:'6 months of ration for 40 widows',
    desc:'Flour, rice, oil and lentils delivered monthly to households with no earning member.',
    raised:184000, goal:480000, days:24 },
  { id:'water', tag:'Water', icon:'water',
    title:'Hand-pump for village Gul Bela',
    desc:'120 families walk 4 km for water. One pump ends it — and the contractor is already on site.',
    raised:312000, goal:350000, days:6 },
  { id:'school', tag:'Education', icon:'education',
    title:'Fees for 25 students this term',
    desc:'Children who dropped out after the flood are back in class — fees, uniform and books included.',
    raised:96000, goal:400000, days:31 },
  { id:'icu', tag:'Emergency', icon:'emergency',
    title:'ICU stay for an accident victim',
    desc:'A rickshaw driver needs nine days of intensive care. Every day funded buys him time.',
    raised:245000, goal:300000, days:4 },
  { id:'qurbani', tag:'Seasonal', icon:'seasonal',
    title:'Qurbani shares for 100 families',
    desc:'Fresh meat reaches families who eat it twice a year. Booked with a verified slaughterhouse.',
    raised:1200000, goal:2000000, days:47 },
];

/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const num = n => Math.round(n).toLocaleString('en-PK');
const money = n => `${CONFIG.currency} ${num(n)}`;
const parseAmount = v => Number(String(v).replace(/[^\d]/g, '')) || 0;

/* ---------- state ---------- */
const state = { c:null, amount:2000, freq:'once', coverFee:true, method:'', mode:'mobile', cur:'PKR' };
const gross = () => state.freq === 'monthly' ? state.amount
                 : (state.coverFee ? Math.round(state.amount * (1 + CONFIG.feePercent / 100)) : state.amount);

/* =========================================================
   1. Campaigns
   ========================================================= */
$('#campaigns-grid').innerHTML = CAMPAIGNS.map(c => {
  const pct = Math.min(100, Math.round(c.raised / c.goal * 100));
  return `
  <article class="campaign">
    <div class="campaign-arch">
      <span class="arch-medal">
        <svg class="ico" viewBox="0 0 24 24"><use href="#${ICONS[c.icon]}"/></svg>
      </span>
      <span class="campaign-tag">${c.tag}</span>
    </div>
    <h3>${c.title}</h3>
    <p class="desc">${c.desc}</p>
    <div class="meta"><span>Raised <b>${money(c.raised)}</b></span><span>${pct}%</span></div>
    <div class="bar"><i data-pct="${pct}"></i></div>
    <div class="meta"><span>Goal ${money(c.goal)}</span><span>${c.days} days left</span></div>
    <button class="btn btn-primary btn-block" type="button" data-donate="${c.id}">
      <svg class="ico" viewBox="0 0 24 24"><use href="#i-heart"/></svg>Donate Now
    </button>
  </article>`;
}).join('');

/* Force a layout pass first: it commits the bars at their CSS width of 0,
   so the CSS transition still animates. Setting the widths synchronously
   rather than inside requestAnimationFrame means they are always correct —
   rAF never fires while the tab is in the background, which would otherwise
   leave every progress bar empty. */
void $('#campaigns-grid').offsetHeight;
$$('#campaigns-grid .bar i').forEach(i => i.style.width = i.dataset.pct + '%');

/* presets */
$('#presets').innerHTML = CONFIG.presets.map((v, i) =>
  `<button type="button" class="preset${i === 1 ? ' on' : ''}" data-amt="${v}">${money(v)}</button>`).join('');

/* =========================================================
   2. Modal + views
   ========================================================= */
const modal = $('#modal'), sheet = $('#sheet');
const TITLES = {
  amount:'Make a donation', method:'Choose payment method',
  request:'Raast payment details', card:'Card payment', done:'Donation complete',
};
let lastFocus = null;

function view(v) {
  sheet.dataset.view = v;
  $$('.panel', modal).forEach(p => p.hidden = p.dataset.panel !== v);
  $('#sheet-title').textContent = TITLES[v];
  sheet.scrollTop = 0;
}

function openModal(cause) {
  Object.assign(state, { c:cause, amount:CONFIG.presets[1], freq:'once', coverFee:true, method:'', mode:'mobile', cur:'PKR' });
  $$('.seg-btn').forEach(b => b.classList.toggle('on', b.dataset.freq === 'once'));
  $$('.preset').forEach(b => b.classList.toggle('on', parseAmount(b.dataset.amt) === state.amount));
  $$('.cur').forEach(b => b.classList.toggle('on', b.dataset.cur === 'PKR'));
  $('#cover-fee').checked = true;
  $('#card-form').reset();
  $('#card-err').textContent = '';
  $('#req-input').value = '';
  setMode('mobile');
  $('#plan-campaign').textContent = cause.title;
  refreshAmounts();   // also resets the amount field, so a stale custom
  lastFocus = document.activeElement;   // amount can never outlive its state
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  view('amount');
  setTimeout(() => $('#to-pay').focus(), 220);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastFocus) lastFocus.focus();
}

/* open / navigate / close */
document.addEventListener('click', e => {
  const d = e.target.closest('[data-donate]');
  if (d) { const c = CAMPAIGNS.find(x => x.id === d.dataset.donate); if (c) openModal(c); return; }

  const g = e.target.closest('[data-goto]');
  if (g) {
    const v = g.dataset.goto;
    if (v === 'method') $('#plan-method-label').textContent = 'Total donation';
    view(v);
    return;
  }
  if (e.target.closest('[data-close]')) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

$('[data-scroll]').addEventListener('click', e => {
  e.preventDefault(); $('#campaigns').scrollIntoView({ behavior:'smooth' });
});

/* =========================================================
   3. Amount view
   ========================================================= */
function refreshAmounts() {
  $('#amount-input').value = num(state.amount);
  $$('.preset').forEach(b => b.classList.toggle('on', parseAmount(b.dataset.amt) === state.amount));
  $('#to-pay').disabled = state.amount < 1;
  refresh();
}

function refresh() {
  const g = gross();
  const net = state.freq === 'monthly' ? state.amount
            : Math.round(state.amount / (state.coverFee ? 1 + CONFIG.feePercent / 100 : 1));
  const per = state.freq === 'monthly' ? ' / month' : '';

  /* plan strip */
  $('#plan-freq').textContent = state.freq === 'monthly' ? 'Monthly' : 'One-time';
  $('#plan-amount').textContent = money(g) + per;
  $('#plan-badge').textContent = state.coverFee && state.freq === 'once' ? 'Fee covered' : '0% platform fee';
  $('#plan-note').textContent = `Campaign receives ${money(net)}`;

  /* amount step: what the campaign actually receives */
  $('#summary-receive').textContent = money(net) + (state.freq === 'monthly' ? ' / month' : '');

  /* request view */
  $('#req-amount').textContent = money(g);

  /* card view (pic 3) */
  const usd = g / CONFIG.usdRate;
  const shown = state.cur === 'PKR' ? money(g) : `$${usd.toFixed(2)}`;
  $('#co-amount').innerHTML = `${shown} <span id="co-per">${state.freq === 'monthly' ? 'per month' : 'once'}</span>`;
  $('#co-campaign-label').textContent = `Donate to ${state.c ? state.c.title : 'a campaign'}`;
  $('#li-campaign').textContent = state.c ? state.c.title : 'Campaign';
  $('#li-freq').textContent = state.freq === 'monthly' ? 'Monthly donation' : 'One-time donation';
  $('#li-amount').textContent = shown;
  $('#card-submit-label').textContent = `Donate ${shown}`;
}

$('#frequency').addEventListener('click', e => {
  const b = e.target.closest('.seg-btn'); if (!b) return;
  state.freq = b.dataset.freq;
  $$('.seg-btn').forEach(x => x.classList.toggle('on', x === b));
  refreshAmounts();
});
$('#presets').addEventListener('click', e => {
  const b = e.target.closest('.preset'); if (!b) return;
  state.amount = parseAmount(b.dataset.amt); refreshAmounts();
});
$('#amount-input').addEventListener('input', e => {
  const raw = e.target.value;
  state.amount = parseAmount(raw);
  e.target.value = raw === '' ? '' : num(state.amount);
  refreshAmounts();
});
$('#amount-input').addEventListener('blur', () => {
  if (!state.amount) { state.amount = CONFIG.presets[0]; refreshAmounts(); }
});
$('#cover-fee').addEventListener('change', e => { state.coverFee = e.target.checked; refresh(); });

$('#to-pay').addEventListener('click', () => {
  if (state.amount < 1) return;
  $('#plan-method-label').textContent = 'Total donation';
  view('method');
});

/* =========================================================
   4. Request to Pay (pic 2)
   ========================================================= */
function setMode(mode) {
  state.mode = mode;
  $$('.toggle-btn').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  const input = $('#req-input'), hint = $('#req-hint');
  if (mode === 'mobile') {
    input.placeholder = '03xxxxxxxxx';
    input.inputMode = 'numeric';
    input.maxLength = 11;
    hint.textContent = '11 digits, starting with 03. We only use this to send the request.';
  } else {
    input.placeholder = 'PK00 XXXX 0000 0000 0000 0000';
    input.inputMode = 'text';
    input.maxLength = 29;
    hint.textContent = '24 characters, starting with PK. You will find it in your bank app.';
  }
  input.value = '';
  input.classList.remove('bad');
  hint.classList.remove('bad');
}

$('#req-toggle').addEventListener('click', e => {
  const b = e.target.closest('.toggle-btn');
  if (b) setMode(b.dataset.mode);
});

$('#req-input').addEventListener('input', e => {
  let v = e.target.value;
  if (state.mode === 'mobile') v = v.replace(/\D/g, '').slice(0, 11);
  else v = v.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 29);
  e.target.value = v;
});

$('#send-request').addEventListener('click', () => {
  const input = $('#req-input'), hint = $('#req-hint');
  const v = input.value.trim();
  // Raast Mobile ID is 03 + 9 digits; a PK IBAN is PK + 2 check digits
  // + a 4-letter bank code + 16 digits (24 characters in total)
  const ok = state.mode === 'mobile'
    ? /^03\d{9}$/.test(v.replace(/\s/g, ''))
    : /^PK\d{2}[A-Z]{4}\d{16}$/.test(v.replace(/\s/g, ''));
  input.classList.toggle('bad', !ok);
  hint.classList.toggle('bad', !ok);
  if (!ok) {
    hint.textContent = state.mode === 'mobile'
      ? 'Enter a valid 11-digit Raast Mobile ID (03XXXXXXXXX).'
      : 'Enter a valid 24-character IBAN starting with PK.';
    input.focus(); return;
  }
  state.method = `Raast Request to Pay · ${v}`;
  finish('Request sent', 'Approve the request in your bank app within 5 minutes. If it expires, you can send it again.');
});

/* =========================================================
   5. Card (pic 3)
   ========================================================= */
const cardNum = $('#card-number'), cardExp = $('#card-exp'), cardCvv = $('#card-cvv'), cardName = $('#card-name');
const brandOf = d => /^4/.test(d) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(d) ? 'MASTERCARD'
                    : /^3[47]/.test(d) ? 'AMEX' : /^62/.test(d) ? 'UNIONPAY' : '';

cardNum.addEventListener('input', () => {
  cardNum.value = cardNum.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const b = brandOf(cardNum.value.replace(/\D/g, ''));
  $('.b-visa').style.opacity = (!b || b === 'VISA') ? '1' : '.3';
  $('.b-mc').style.opacity = (!b || b === 'MASTERCARD') ? '1' : '.3';
});
cardExp.addEventListener('input', () => {
  let d = cardExp.value.replace(/\D/g, '').slice(0, 4);
  cardExp.value = d.length >= 3 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
});
cardCvv.addEventListener('input', () => { cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4); });

$('#currency').addEventListener('click', e => {
  const b = e.target.closest('.cur'); if (!b) return;
  state.cur = b.dataset.cur;
  $$('.cur').forEach(x => x.classList.toggle('on', x === b));
  refresh();
});

function luhn(n) {
  let sum = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = +n[i];
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return sum % 10 === 0;
}

$('#card-form').addEventListener('submit', e => {
  e.preventDefault();
  const err = $('#card-err');
  const digits = cardNum.value.replace(/\D/g, '');
  const brand = brandOf(digits);
  const need = brand === 'AMEX' ? 15 : 16;
  const [mm, yy] = cardExp.value.split('/').map(s => s.trim());
  const m = +mm, y = +yy, now = new Date();
  const cvvLen = brand === 'AMEX' ? 4 : 3;

  let msg = '';
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test($('#co-email').value.trim())) msg = 'Enter a valid email for your receipt.';
  else if (digits.length !== need) msg = `Card number must be ${need} digits.`;
  else if (!luhn(digits)) msg = 'That card number looks invalid.';
  else if (!mm || !yy || m < 1 || m > 12) msg = 'Enter the expiry as MM / YY.';
  else if (y < now.getFullYear() % 100 || (y === now.getFullYear() % 100 && m < now.getMonth() + 1)) msg = 'This card has expired.';
  else if (cardCvv.value.length !== cvvLen) msg = `CVC must be ${cvvLen} digits.`;
  else if (cardName.value.trim().length < 3) msg = 'Enter the full name printed on the card.';

  [cardNum, cardExp, cardCvv, cardName].forEach(i => i.classList.toggle('bad', !!msg));
  err.textContent = msg;
  if (msg) { sheet.scrollTop = 0; return; }

  state.method = `${brand.charAt(0) + brand.slice(1).toLowerCase()} ···· ${digits.slice(-4)}`;
  finish('Payment successful', `We charged ${money(gross())} and sent a receipt to your email.`);
});

/* =========================================================
   6. Done
   ========================================================= */
function finish(title, sub) {
  $('#done-title').textContent = title;
  $('#done-sub').textContent = sub;
  $('#rc-campaign').textContent = state.c.title;
  $('#rc-amount').textContent = money(gross()) + (state.freq === 'monthly' ? ' / month' : '');
  $('#rc-method').textContent = state.method;
  $('#rc-freq').textContent = state.freq === 'monthly' ? 'Monthly' : 'One-time';
  $('#rc-id').textContent = 'NK-' + Date.now().toString(36).toUpperCase().slice(-8);
  view('done');
}

$('#copy-id').addEventListener('click', () => {
  /* only the label changes — writing to the button itself would drop its icon */
  const label = $('#copy-id-label');
  navigator.clipboard?.writeText($('#rc-id').textContent);
  const old = label.textContent;
  label.textContent = 'Copied ✓';
  setTimeout(() => label.textContent = old, 1600);
});

/* =========================================================
   7. Platform totals (hero)
   Nothing about these numbers is hard-coded. renderStats draws
   only what the API hands it and draws nothing at all while
   there is no data, so the hero can never show an invented
   figure. Expected contract:

     GET /api/stats -> { campaignsFunded, totalRaised, averagePayoutHours }

   Wire it up by calling renderStats(stats) once that endpoint
   exists; until then the hero simply has no totals, which is
   the intended state.
   ========================================================= */
const STAT_LABELS = {
  campaignsFunded:   "campaigns funded",
  totalRaised:       "raised so far",
  averagePayoutHours:"average payout",
};

function statValue(key, v) {
  if (key === "totalRaised")        return money(v);
  if (key === "averagePayoutHours") return num(v) + " hrs";
  return num(v);
}

function renderStats(stats = null) {
  const box = $("#hero-stats");
  if (!box) return;
  const rows = Object.entries(stats || {})
    .filter(([k, v]) => k in STAT_LABELS && v !== null && v !== undefined && v !== "");
  box.innerHTML = rows
    .map(([k, v]) => `<div><b>${statValue(k, v)}</b><span>${STAT_LABELS[k]}</span></div>`)
    .join("");
}

/* =========================================================
   8. Boot
   ========================================================= */
setMode('mobile');
refreshAmounts();
$('#year').textContent = new Date().getFullYear();
renderStats();
