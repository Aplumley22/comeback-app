import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/',        icon: '🏠', label: 'Dashboard' },
      { to: '/checkin', icon: '✅', label: 'Daily Check-In' },
      { to: '/weekly',  icon: '📊', label: 'Weekly Review' },
    ]
  },
  {
    label: 'Protocol',
    items: [
      { to: '/supplements', icon: '💊', label: 'Supplements' },
      { to: '/training',    icon: '🏋️', label: 'Training Log' },
    ]
  },
  {
    label: 'Tracking',
    items: [
      { to: '/progress', icon: '📈', label: 'Progress & Charts' },
      { to: '/labs',     icon: '🔬', label: 'Lab Work & Testing' },
    ]
  }
]

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const sidebar = (
    <>
      <div className="sidebar-logo">
        🏆 Comeback Protocol
        <span>Andrew — April 2026</span>
      </div>
      {NAV_SECTIONS.map(section => (
        <div key={section.label}>
          <div className="sidebar-section">{section.label}</div>
          {section.items.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      ))}
      <div className="sidebar-footer">
        Pain &gt; 3/10 → stop &amp; contact Vastas PT<br />
        Sharp Achilles pain → contact UVM Sports Med
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.email}</span><br />
          <button
            onClick={handleSignOut}
            style={{ marginTop: 6, fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div className="sidebar" style={{ display: 'flex' }}>
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="sidebar"
            style={{ position: 'relative', display: 'flex' }}
            onClick={e => e.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="main" style={{ flex: 1 }}>
        {/* Mobile top bar */}
        <div style={{
          display: 'none',
          padding: '12px 16px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
          className="mobile-topbar"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}
          >
            ☰
          </button>
          <span style={{ fontFamily: 'Bebas Neue', color: 'var(--green)', fontSize: 16, letterSpacing: 1 }}>
            Comeback Protocol
          </span>
          <span />
        </div>

        {children}
      </div>

      <style>{`
        .sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 240px;
          background: var(--surface); border-right: 1px solid var(--border);
          flex-direction: column; z-index: 100; overflow-y: auto;
        }
        .sidebar-logo {
          padding: 20px 20px 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 1px; color: var(--green);
          border-bottom: 1px solid var(--border);
        }
        .sidebar-logo span {
          color: var(--text2); font-size: 11px; display: block;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0;
          margin-top: 2px; font-weight: 400;
        }
        .sidebar-section {
          padding: 16px 12px 8px;
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--text3); font-weight: 500;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 16px; cursor: pointer; border-radius: 6px;
          margin: 1px 8px; font-size: 13.5px; color: var(--text2);
          transition: all 0.15s;
        }
        .nav-item:hover { background: var(--surface2); color: var(--text); }
        .nav-item.active {
          background: var(--green-bg); color: var(--green);
          border: 1px solid var(--green-border);
        }
        .nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
        .sidebar-footer {
          margin-top: auto; padding: 16px; border-top: 1px solid var(--border);
          font-size: 11px; color: var(--text3); line-height: 1.5;
        }
        .main { margin-left: 240px; min-height: 100vh; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main { margin-left: 0; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
