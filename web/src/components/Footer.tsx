import { BRAND } from '../content/site'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span className="brand">
          <Logo />
          {BRAND.name}
        </span>
      </div>
    </footer>
  )
}
