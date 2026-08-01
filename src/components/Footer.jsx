import { Link, useNavigate } from 'react-router-dom'
import Wordmark from './Wordmark'

const ADMIN_CODE = 'ADMIN2010sem2'

export default function Footer() {
  const navigate = useNavigate()

  function handleMonitorClick() {
    const entered = window.prompt('Access code:')
    if (entered === ADMIN_CODE) {
      navigate('/admin')
    } else {
      // Wrong code, or the prompt was cancelled — either way, back to
      // the landing page. No error message, so a wrong guess teaches an
      // outsider nothing about whether they were close.
      navigate('/')
    }
  }

  return (
    <footer className="bg-canopy/[0.04] border-t border-onLight/8 mt-32">
      <div className="container-page py-14 flex flex-col md:flex-row justify-between gap-8 text-sm">
        <div>
          <Wordmark className="text-lg mb-3" />
          <p className="max-w-xs text-onLight/50">
            A marketplace built for the people who make things, and the people who love finding them.
          </p>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Company</span>
            <Link to="/#why-shop" className="text-onLight/60 hover:text-leaf-dim">Why shop with us</Link>
            <Link to="/#why-sell" className="text-onLight/60 hover:text-leaf-dim">Why sell with us</Link>
            <Link to="/#partner" className="text-onLight/60 hover:text-leaf-dim">Partner with us</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Legal</span>
            <Link to="/terms" className="text-onLight/60 hover:text-leaf-dim">Terms & Privacy</Link>
          </div>
        </div>
      </div>
      <div className="container-page py-6 border-t border-onLight/8 text-xs text-onLight/35 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Prepplus Global Limited. All rights reserved.</span>
        {/* Intentionally unstyled beyond a plain word so it doesn't read as
            a real nav item to a casual visitor — not hidden via CSS (that's
            trivially found in devtools), just visually unremarkable. */}
        <button
          onClick={handleMonitorClick}
          className="text-onLight/25 hover:text-onLight/40 transition-colors"
        >
          Monitor
        </button>
      </div>
    </footer>
  )
}
