import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadWeightLog, logWeight, loadAllWeeklyReviews, loadMilestones, completeMilestone, loadRecentCheckins, loadHeelRaiseTotal, todayKey } from '../lib/db'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts'

const SUPP_KEYS = ['creatine','omega3','d3k2','lionsmane','avmacol','protein','collagen','vitc','mag','ashwa']

const MILESTONES = [
  { key: 'full-weight-bearing',  label: 'Full weight bearing',          date: 'Week 6',                    done: true  },
  { key: 'out-of-boot',          label: 'Out of boot',                   date: 'Apr 2026',                  done: true  },
  { key: 'walking-in-shoe',      label: 'Walking in shoe',               date: 'Apr 2026',                  done: true  },
  { key: 'single-lift',          label: 'Single heel lift',              date: 'May 2026',                  done: true  },
  { key: 'no-lift',              label: 'No heel lift',                  date: 'May 2026',                  done: true  },
  { key: 'two-leg-calf-raise',   label: 'Two-leg calf raises',           date: 'Jun 2026',                  done: true  },
  { key: 'peloton-cleared',      label: 'Peloton / stationary bike',     date: 'Jun 2026',                  done: true  },
  { key: 'full-upper-body',          label: 'Full upper body training',   date: 'Jun 2026',              done: true  },
  { key: 'ten-thousand-heel-raises', label: '10,000 Heel Raises',         date: 'Clinical — Vastas PT',  done: false, isProgress: true },
  { key: 'single-leg-calf-raise',    label: 'Single leg calf raise',      date: 'TBD — Vastas PT',       done: false },
  { key: 'jogging',              label: 'Jogging cleared',               date: 'TBD — UVM Sports Medicine', done: false },
  { key: 'basketball',           label: 'Return to basketball',          date: 'TBD',                       done: false },
  { key: 'golf',                 label: 'Return to golf',                date: 'TBD',                       done: false },
]

const CHART_STYLE = {
  cartesianGrid: 'rgba(255,255,255,0.05)',
  axisColor: '#5a5855',
  tooltipBg: '#1a1d24',
}

function ComplianceRing({ label, pct, color }) {
  const r = 32
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="compliance-card">
      <div className="compliance-ring-wrap">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle className="compliance-ring-bg" cx="40" cy="40" r={r} />
          <circle
            className="compliance-ring-fill"
            cx="40" cy="40" r={r}
            stroke={color}
            strokeDasharray={`${circ.toFixed(1)}`}
            strokeDashoffset={`${offset.toFixed(1)}`}
          />
        </svg>
        <div className="compliance-pct" style={{ color }}>{pct}%</div>
      </div>
      <div className="compliance-label">{label}</div>
    </div>
  )
}

export default function Progress() {
  const { user } = useAuth()
  const { visible, msg, showToast } = useToast()
  const [weights, setWeights] = useState([])
  const [weeklyReviews, setWeeklyReviews] = useState([])
  const [recentCheckins, setRecentCheckins] = useState([])
  const [milestones, setMilestones] = useState({})
  const [weightInput, setWeightInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [heelRaiseTotal, setHeelRaiseTotal] = useState(0)

  useEffect(() => {
    if (!user) return
    Promise.all([
      loadWeightLog(user.id),
      loadAllWeeklyReviews(user.id),
      loadRecentCheckins(user.id),
      loadMilestones(user.id),
      loadHeelRaiseTotal(user.id),
    ]).then(([w, wr, ci, ms, hrt]) => {
      setWeights(w)
      setWeeklyReviews(wr)
      setRecentCheckins(ci)
      const map = {}
      ms.forEach(r => { map[r.milestone_key] = true })
      setMilestones(map)
      setHeelRaiseTotal(hrt)
      setLoading(false)
    })
  }, [user])

  async function handleLogWeight() {
    const val = parseFloat(weightInput)
    if (!val || val < 100 || val > 400) { showToast('Enter a valid weight'); return }
    const error = await logWeight(user.id, todayKey(), val)
    if (!error) {
      setWeights(prev => {
        const filtered = prev.filter(w => w.date !== todayKey())
        return [...filtered, { date: todayKey(), weight: val }].sort((a, b) => a.date.localeCompare(b.date))
      })
      setWeightInput('')
      showToast('Weight logged!')
    }
  }

  async function handleMilestone(key) {
    await completeMilestone(user.id, key)
    setMilestones(prev => ({ ...prev, [key]: true }))
    showToast('Milestone unlocked! 🎉')
  }

  const latestWeight = weights.length ? weights[weights.length - 1].weight : 230
  const start = 230, goal = 200
  const progress = Math.max(0, Math.min(100, ((start - latestWeight) / (start - goal)) * 100))
  const remaining = Math.max(0, latestWeight - goal).toFixed(1)

  // Build chart data from weekly reviews
  const weeks = ['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8']
  const weightChartData = weeks.map((label, i) => ({
    label,
    weight: weights[i]?.weight ?? (weeklyReviews[i]?.weight ? parseFloat(weeklyReviews[i].weight) : null)
  })).filter(d => d.weight !== null)

  const weeklyChartData = weeklyReviews.map((r, i) => ({
    label: weeks[i] || `Wk${i+1}`,
    pain: r.avg_pain ? parseFloat(r.avg_pain) : null,
    compliance: r.compliance ? parseFloat(r.compliance) : null,
    sleep: r.avg_sleep ? parseFloat(r.avg_sleep) : null,
  }))

  // Compliance rings from recent checkins
  let suppChecked = 0, suppTotal = 0, painSum = 0, painCount = 0
  recentCheckins.forEach(ci => {
    SUPP_KEYS.forEach(k => { suppTotal++; if (ci[k]) suppChecked++ })
    if (ci.pain_level !== null) { painSum += ci.pain_level; painCount++ }
  })
  const suppPct = suppTotal ? Math.round((suppChecked / suppTotal) * 100) : 0
  const painAvg = painCount ? painSum / painCount : 0
  const painPct = Math.max(0, Math.round((1 - painAvg / 10) * 100))
  const painColor = painAvg <= 2 ? '#52b788' : painAvg <= 3 ? '#d4a017' : '#e05c5c'

  const tooltipStyle = {
    contentStyle: { background: CHART_STYLE.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 },
    labelStyle: { color: '#f0ede8' },
    itemStyle: { color: '#9a9690' },
  }

  return (
    <>
      <Cover bgText="PROGRESS" label="Progress & charts — update weekly every Sunday" />
      <div className="page-inner">
        <div className="page-icon">📈</div>
        <div className="page-title">Progress &amp; Charts</div>
        <div className="page-sub">Your comeback in numbers. Log your weight and the charts update automatically.</div>

        {/* Weight tracker */}
        <div className="section-label">Weight tracker</div>
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
          <div className="weight-input-row">
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="Enter today's weight..."
              min="150" max="350" step="0.1"
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={handleLogWeight}>Log Weight</button>
          </div>
        </div>

        {/* Compliance rings */}
        <div className="section-label">This week's compliance</div>
        <div className="compliance-grid">
          <ComplianceRing label="Supplement compliance" pct={suppPct} color="#52b788" />
          <ComplianceRing label="Pain score (lower = better)" pct={painPct} color={painColor} />
          <ComplianceRing
            label={`Pain avg: ${painAvg.toFixed(1)}/10`}
            pct={painPct}
            color={painColor}
          />
        </div>

        {/* Charts */}
        <div className="section-label">Trend charts</div>
        <div className="charts-2col">
          <div className="chart-card">
            <div className="chart-card-header">
              <div><div className="chart-card-title">Weight trend</div><div className="chart-card-sub">lbs over 8 weeks</div></div>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData.length ? weightChartData : [{ label: 'Start', weight: 230 }]}>
                  <CartesianGrid stroke={CHART_STYLE.cartesianGrid} />
                  <XAxis dataKey="label" tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <YAxis domain={[195, 235]} tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <Tooltip {...tooltipStyle} />
                  <ReferenceLine y={200} stroke="rgba(82,183,136,0.4)" strokeDasharray="4 4" label={{ value: 'Goal: 200', fill: '#52b788', fontSize: 10 }} />
                  <Line type="monotone" dataKey="weight" stroke="#52b788" strokeWidth={2} dot={{ fill: '#52b788', r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-card-header">
              <div><div className="chart-card-title">Pain level</div><div className="chart-card-sub">weekly average</div></div>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData.length ? weeklyChartData : weeks.map(l => ({ label: l, pain: null }))}>
                  <CartesianGrid stroke={CHART_STYLE.cartesianGrid} />
                  <XAxis dataKey="label" tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <Tooltip {...tooltipStyle} />
                  <ReferenceLine y={3} stroke="rgba(224,92,92,0.4)" strokeDasharray="4 4" label={{ value: 'Max: 3', fill: '#e05c5c', fontSize: 10 }} />
                  <Line type="monotone" dataKey="pain" stroke="#e05c5c" strokeWidth={2} dot={{ fill: '#e05c5c', r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="charts-2col">
          <div className="chart-card">
            <div className="chart-card-header">
              <div><div className="chart-card-title">Supplement compliance</div><div className="chart-card-sub">% taken each week</div></div>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData.length ? weeklyChartData : weeks.map(l => ({ label: l, compliance: null }))}>
                  <CartesianGrid stroke={CHART_STYLE.cartesianGrid} />
                  <XAxis dataKey="label" tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="compliance" stroke="#4a9edd" strokeWidth={2} dot={{ fill: '#4a9edd', r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-card-header">
              <div><div className="chart-card-title">Sleep</div><div className="chart-card-sub">avg hours per week</div></div>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData.length ? weeklyChartData : weeks.map(l => ({ label: l, sleep: null }))}>
                  <CartesianGrid stroke={CHART_STYLE.cartesianGrid} />
                  <XAxis dataKey="label" tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <YAxis domain={[4, 10]} tick={{ fill: CHART_STYLE.axisColor, fontSize: 10 }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="sleep" stroke="#b088d4" strokeWidth={2} dot={{ fill: '#b088d4', r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="section-label">Achilles milestones</div>
        <div className="milestone-list">
          {MILESTONES.map(m => {
            const isDone = m.done || milestones[m.key] || (m.isProgress && heelRaiseTotal >= 10000)
            return (
              <div key={m.key} className="milestone-item">
                {isDone ? (
                  <div className="m-check-done">
                    <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, stroke: 'white', fill: 'none', strokeWidth: 2.5 }}>
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                ) : m.isProgress ? (
                  <div className="m-check-pending" style={{ cursor: 'default', borderColor: 'var(--green)' }} />
                ) : (
                  <div className="m-check-pending" onClick={() => handleMilestone(m.key)} />
                )}
                <span className={`m-text${isDone ? ' done' : ''}`}>{m.label}</span>
                {isDone
                  ? <span className="m-badge m-badge-green">Done</span>
                  : m.isProgress
                    ? <span style={{ fontSize: 11, color: 'var(--green)', marginLeft: 8, whiteSpace: 'nowrap' }}>{heelRaiseTotal.toLocaleString()} / 10,000</span>
                    : null
                }
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
