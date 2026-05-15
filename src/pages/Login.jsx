import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--green)', letterSpacing: 1 }}>🏆 Comeback Protocol</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Andrew — Personal health &amp; fitness tracker</div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px 0', fontSize: 13, fontFamily: 'DM Sans',
                  background: mode === m ? 'var(--green)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text2)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '10px 14px', color: 'var(--text)',
                  fontFamily: 'DM Sans', fontSize: 14, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '10px 14px', color: 'var(--text)',
                  fontFamily: 'DM Sans', fontSize: 14, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="save-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 0 }}
            >
              {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text3)' }}>
          Confidential — Andrew's personal recovery tracker
        </div>
      </div>
    </div>
  )
}
