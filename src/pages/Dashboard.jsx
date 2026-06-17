import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadWeightLog, loadCheckin, loadMilestones, completeMilestone, todayKey } from '../lib/db'

const SUPP_KEYS = ['creatine','omega3','d3k2','lionsmane','avmacol','protein','collagen','vitc','mag','ashwa']

const PROTOCOL_START = new Date('2026-06-02')
const TRIATHLON_DATE = new Date('2027-09-06')

function calcCurrentWeek() {
  const diffMs = Date.now() - PROTOCOL_START.getTime()
  return Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1)
}

const MILESTONES = [
  { key: 'full-weight-bearing',  label: 'Full weight bearing',          date: 'Week 6',                    done: true  },
  { key: 'out-of-boot',          label: 'Out of boot',                   date: 'Apr 2026',                  done: true  },
  { key: 'walking-in-shoe',      label: 'Walking in shoe',               date: 'Apr 2026',                  done: true  },
  { key: 'single-lift',          label: 'Single heel lift',              date: 'May 2026',                  done: true  },
  { key: 'no-lift',              label: 'No heel lift',                  date: 'May 2026',                  done: true  },
  { key: 'two-leg-calf-raise',   label: 'Two-leg calf raises',           date: 'Jun 2026',                  done: true  },
  { key: 'peloton-cleared',      label: 'Peloton / stationary bike',     date: 'Jun 2026',                  done: true  },
  { key: 'full-upper-body',      label: 'Full upper body training',      date: 'Jun 2026',                  done: true  },
  { key: 'single-leg-calf-raise', label: 'Single leg calf raise',        date: 'TBD — Vastas PT',           done: false },
  { key: 'jogging',              label: 'Jogging cleared',               date: 'TBD — UVM Sports Medicine', done: false },
  { key: 'basketball',           label: 'Return to basketball',          date: 'TBD',                       done: false },
  { key: 'golf',                 label: 'Return to golf',                date: 'TBD',                       done: false },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { visible, msg, showToast } = useToast()
  const [latestWeight, setLatestWeight] = useState(230)
  const [suppPct, setSuppPct] = useState(0)
  const [milestones, setMilestones] = useState({})

  useEffect(() => {
    if (!user) return
    loadWeightLog(user.id).then(rows => {
      if (rows.length) setLatestWeight(rows[rows.length - 1].weight)
    })
    loadCheckin(user.id, todayKey()).then(ci => {
      if (ci) {
        const checked = SUPP_KEYS.filter(k => ci[k]).length
        setSuppPct(Math.round((checked / SUPP_KEYS.length) * 100))
      }
    })
    loadMilestones(user.id).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.milestone_key] = true })
      setMilestones(map)
    })
  }, [user])

  async function handleMilestone(key) {
    await completeMilestone(user.id, key)
    setMilestones(prev => ({ ...prev, [key]: true }))
    showToast('Milestone unlocked! 🎉')
  }

  const start = 230, goal = 200
  const progress = Math.max(0, Math.min(100, ((start - latestWeight) / (start - goal)) * 100))
  const remaining = Math.max(0, latestWeight - goal).toFixed(1)

  const now = new Date()
  const daysToTriathlon = Math.max(0, Math.ceil((TRIATHLON_DATE - now) / (1000 * 60 * 60 * 24)))
  const weeksToTriathlon = Math.floor(daysToTriathlon / 7)
  const currentTrainingWeek = calcCurrentWeek()

  return (
    <>
      <Cover bgText="COMEBACK" label="Andrew's comeback protocol — confidential — June 2026" />
      <div className="page-inner">
        <div className="page-icon">🏆</div>
        <div className="page-title">Andrew's Comeback Protocol</div>
        <div className="page-sub">Week 14 post-op &nbsp;·&nbsp; Almost fully cleared &nbsp;·&nbsp; Home gym training started &nbsp;·&nbsp; 230 → 200 lbs</div>

        <div className="callout callout-green">
          <span className="callout-icon">✅</span>
          <div className="callout-content">
            <div className="callout-title">Week 14 — major milestones cleared</div>
            <div className="callout-text">Out of boot, walking in shoe, single heel lift, no heel lift, two-leg calf raises, Peloton, and full upper body training — all cleared as of June 2026. 8 milestones done. Single leg calf raise is next.</div>
          </div>
        </div>
        <div className="callout callout-red">
          <span className="callout-icon">⚠️</span>
          <div className="callout-content">
            <div className="callout-title">Priority #1 — Non-negotiable</div>
            <div className="callout-text">Address the vaping. Nicotine directly impairs Achilles tendon repair — vaping group showed the lowest tensile load to failure in published research. No supplement compensates for it. Book cessation support at Preventive Medicine VT.</div>
          </div>
        </div>
        <div className="callout callout-amber">
          <span className="callout-icon">📞</span>
          <div className="callout-content">
            <div className="callout-title">Next action — book this week</div>
            <div className="callout-text">Call Preventive Medicine VT (Colchester) to establish as a new patient. Request comprehensive bloodwork including testosterone (total + free), SHBG, Vitamin D, RBC magnesium, full thyroid panel, hsCRP, and Omega-3 Index.</div>
          </div>
        </div>

        <div className="section-label">North Star Goal</div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(82,183,136,0.12), rgba(82,183,136,0.04))',
          border: '1px solid var(--green-border)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>🏊</span>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 1, color: 'var(--green)', lineHeight: 1 }}>Sprint Triathlon</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>750m swim · 20km bike · 5km run · September 6, 2027</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, color: 'var(--green)', lineHeight: 1 }}>{daysToTriathlon}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>Days remaining</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, color: 'var(--green)', lineHeight: 1 }}>{weeksToTriathlon}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>Weeks remaining</div>
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text2)', lineHeight: 1 }}>Training week {currentTrainingWeek}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>Current phase</div>
            </div>
          </div>
        </div>

        <div className="section-label">Quick navigation</div>
        <div className="quick-links">
          {[
            { to: '/checkin',     icon: '✅', label: 'Daily Check-In',      sub: 'Under 2 min — do this daily' },
            { to: '/weekly',      icon: '📊', label: 'Weekly Review',        sub: 'Every Sunday — 10 min' },
            { to: '/supplements', icon: '💊', label: 'Supplement Protocol',  sub: 'Doses, timing, links' },
            { to: '/training',    icon: '🏋️', label: 'Training Log',         sub: 'Daily + weekly workouts' },
            { to: '/progress',    icon: '📈', label: 'Progress & Charts',    sub: 'Weight, compliance, trends' },
            { to: '/labs',        icon: '🔬', label: 'Lab Work & Testing',   sub: 'Bloodwork + providers' },
          ].map(({ to, icon, label, sub }) => (
            <div key={to} className="link-card" onClick={() => navigate(to)}>
              <span className="link-card-icon">{icon}</span>
              <div>
                <div className="link-card-label">{label}</div>
                <div className="link-card-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="section-label">This week at a glance</div>
        <div className="stats-row">
          <div className="stat-card stat-green">
            <div className="stat-label">Current phase</div>
            <div className="stat-value">Wk {currentTrainingWeek}</div>
            <div className="stat-sub">Home gym training</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current weight</div>
            <div className="stat-value">{Number(latestWeight).toFixed(1)}</div>
            <div className="stat-sub">Goal: 200 lbs</div>
          </div>
          <div className="stat-card stat-amber">
            <div className="stat-label">Max pain target</div>
            <div className="stat-value">≤3</div>
            <div className="stat-sub">Out of 10 — always</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Today's compliance</div>
            <div className="stat-value" style={{ color: suppPct >= 80 ? 'var(--green)' : suppPct >= 50 ? 'var(--amber)' : 'var(--text)' }}>{suppPct}%</div>
            <div className="stat-sub">Supplements checked</div>
          </div>
        </div>

        <div className="section-label">Weight progress</div>
        <div className="weight-progress-card">
          <div className="weight-goal-row">
            <span className="weight-goal-start">Start: 230 lbs</span>
            <span className="weight-goal-end">Goal: 200 lbs</span>
          </div>
          <div className="weight-bar-track">
            <div className="weight-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="weight-bar-labels">
            {[230,225,220,215,210,205,200].map(n => <span key={n}>{n}</span>)}
          </div>
          <div className="weight-current-badge">
            <span className="weight-current-num">{Number(latestWeight).toFixed(1)}</span>
            <span className="weight-current-unit">lbs</span>
          </div>
          <div className="weight-remaining">{remaining} lbs to goal</div>
        </div>

        <div className="section-label">Achilles milestones</div>
        <div className="milestone-list">
          {MILESTONES.map(m => {
            const isDone = m.done || milestones[m.key]
            return (
              <div key={m.key} className="milestone-item">
                {isDone ? (
                  <div className="m-check-done">
                    <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, stroke: 'white', fill: 'none', strokeWidth: 2.5 }}>
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                ) : (
                  <div className="m-check-pending" onClick={() => handleMilestone(m.key)} />
                )}
                <span className={`m-text${isDone ? ' done' : ''}`}>{m.label}</span>
                {isDone && <span className="m-badge m-badge-green">Done</span>}
                <span className="m-date">{m.date}</span>
              </div>
            )
          })}
        </div>
      </div>
      <Toast visible={visible} msg={msg} />
    </>
  )
}
