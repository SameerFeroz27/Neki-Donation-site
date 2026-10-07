import { BRAND, NAV } from '../content/site'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="brand" href="#top">
          <Logo />
          <span>{BRAND.name}</span>
        </a>

        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="btn btn--primary btn--sm" href="#campaigns">
          <Icon name="heart" />
          Donate Now
        </a>
      </div>
    </header>
  )
}
