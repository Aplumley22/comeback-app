import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const NAV_ITEMS = [
  { to: '/',            icon: '🏠', label: 'Dashboard' },
  { to: '/checkin',     icon: '✅', label: 'Check-In' },
  { to: '/weekly',      icon: '📊', label: 'Weekly' },
  { to: '/supplements', icon: '💊', label: 'Supplements' },
  { to: '/training',    icon: '🏋️', label: 'Training' },
  { to: '/progress',    icon: '📈', label: 'Progress' },
  { to: '/labs',        icon: '🔬', label: 'Labs' },
]

const NAV_SECTIONS = [
  { label: 'Main',     items: NAV_ITEMS.slice(0, 3) },
  { label: 'Protocol', items: NAV_ITEMS.slice(3, 5) },
  { label: 'Tracking', items: NAV_ITEMS.slice(5, 7) },
]

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Desktop sidebar ── */}
      <nav style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto',
      }} className="desktop-sidebar">
        <div style={{
          padding: '20px 20px 12px',
          fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 1,
          color: 'var(--green)', borderBottom: '1px solid var(--border)',
        }}>
          🏆 Comeback Protocol
          <span style={{ color: 'var(--text2)', fontSize: 11, display: 'block', fontFamily: 'DM Sans, sans-serif', letterSpacing: 0, marginTop: 2, fontWeight: 400 }}>
            Andrew — April 2026
          </span>
        </div>

        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div style={{ padding: '16px 12px 8px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 500 }}>
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 16px', borderRadius: 6, margin: '1px 8px',
                  fontSize: 13.5, textDecoration: 'none', transition: 'all 0.15s',
                  color: isActive ? 'var(--green)' : 'var(--text2)',
                  background: isActive ? 'var(--green-bg)' : 'transparent',
                  border: isActive ? '1px solid var(--green-border)' : '1px solid transparent',
                })}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
          Pain &gt; 3/10 → stop &amp; contact Vastas PT<br />
          Sharp Achilles pain → contact UVM Sports Med
          <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <span style={{ color: 'var(--text3)' }}>{user?.email}</span><br />
            <button onClick={handleSignOut} style={{ marginTop: 6, fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', paddingBottom: 0 }} className="layout-main">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        display: 'none', overflowX: 'auto',
      }} className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flex: '0 0 auto', minWidth: 56,
              padding: '8px 4px 10px', textDecoration: 'none', gap: 2,
              color: isActive ? 'var(--green)' : 'var(--text3)',
              borderTop: isActive ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'color 0.15s',
            })}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: 0.3, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .layout-main { margin-left: 0 !important; padding-bottom: 70px !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
