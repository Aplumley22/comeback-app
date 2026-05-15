import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadCheckin, saveCheckin, todayKey } from '../lib/db'

const SUPP_SECTIONS = [
  {
    id: 'morning',
    header: '☀ Morning — with breakfast',
    headerClass: 'th-morning',
    items: [
      { key: 'creatine',  label: 'Creatine monohydrate',       dose: '5g' },
      { key: 'omega3',    label: 'Omega-3 fish oil',            dose: '2–3 softgels' },
      { key: 'd3k2',      label: 'Vitamin D3 + K2 liquid',      dose: '2 drops' },
      { key: 'lionsmane', label: "Lion's Mane mushroom",         dose: '2 capsules (1,000mg)' },
    ]
  },
  {
    id: 'midday',
    header: '🌿 Midday — with lunch',
    headerClass: 'th-midday',
    items: [
      { key: 'avmacol', label: 'Avmacol (sulforaphane)',      dose: '2 tablets' },
      { key: 'protein', label: 'Protein target on track',    dose: '175–200g/day total' },
    ]
  },
  {
    id: 'pre',
    header: '🔴 Pre-PT — 30–60 min before session',
    headerClass: 'th-pre',
    items: [
      { key: 'collagen', label: 'Collagen peptides',                 dose: '15–20g — cold or room temp water' },
      { key: 'vitc',     label: 'Vitamin C 500mg + bioflavonoids',   dose: '1 capsule — taken at exact same time as collagen' },
    ]
  },
  {
    id: 'night',
    header: '🌙 Night — 30–60 min before bed',
    headerClass: 'th-night',
    items: [
      { key: 'mag',   label: 'Magnesium bisglycinate', dose: '1 scoop wk 1 → 2 scoops after' },
      { key: 'ashwa', label: 'Ashwagandha KSM-66',     dose: '1 capsule (600mg)' },
    ]
  },
]

const SUPP_KEYS = ['creatine','omega3','d3k2','lionsmane','avmacol','protein','collagen','vitc','mag','ashwa']
const PAIN_LABELS = ['No pain ✓','Minimal','Mild','OK — limit','Moderate','Stop & rest','High — flag','High — stop','Severe','Severe — call PT','Emergency']
const PAIN_COLORS = ['#52b788','#52b788','#52b788','#d4a017','#d4a017','#e05c5c','#e05c5c','#e05c5c','#e05c5c','#e05c5c','#e05c5c']

export default function DailyCheckIn() {
  const { user } = useAuth()
  const { visible, msg, showToast } = useToast()
  const [checks, setChecks] = useState({})
  const [steps, setSteps] = useState('')
  const [walk, setWalk] = useState('')
  const [pain, setPain] = useState(0)
  const [sleep, setSleep] = useState('')
  const [score, setScore] = useState(null)
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const debounceRef = useRef(null)

  const today = todayKey()
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    if (!user) return
    loadCheckin(user.id, today).then(ci => {
      if (!ci) return
      const c = {}
      SUPP_KEYS.forEach(k => { c[k] = !!ci[k] })
      setChecks(c)
      setSteps(ci.steps ?? '')
      setWalk(ci.walk_time ?? '')
      setPain(ci.pain_level ?? 0)
      setSleep(ci.sleep_hours ?? '')
      setScore(ci.daily_score ?? null)
    })
  }, [user, today])

  const checkedCount = SUPP_KEYS.filter(k => checks[k]).length
  const suppPct = Math.round((checkedCount / SUPP_KEYS.length) * 100)

  // Build the full payload from current state (or overrides for mid-update calls)
  function buildPayload(overrides = {}) {
    const c = overrides.checks ?? checks
    return {
      ...Object.fromEntries(SUPP_KEYS.map(k => [k, !!c[k]])),
      steps:       (overrides.steps  ?? steps)  ? parseInt(overrides.steps  ?? steps)        : null,
      walk_time:   (overrides.walk   ?? walk)   ? parseInt(overrides.walk   ?? walk)          : null,
      pain_level:  parseInt(overrides.pain  ?? pain),
      sleep_hours: (overrides.sleep  ?? sleep)  ? parseFloat(overrides.sleep ?? sleep)        : null,
      daily_score: overrides.score  ?? score,
    }
  }

  // Immediate save used for checkbox toggles so mobile never loses a check
  async function toggleCheck(key) {
    const newChecks = { ...checks, [key]: !checks[key] }
    setChecks(newChecks)
    setAutoSaved(false)
    const error = await saveCheckin(user.id, today, buildPayload({ checks: newChecks }))
    if (!error) {
      setAutoSaved(true)
      setTimeout(() => setAutoSaved(false), 2000)
    }
  }

  // Debounced save for slider / number inputs (fires 1 s after last change)
  function scheduleAutoSave(overrides) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const error = await saveCheckin(user.id, today, buildPayload(overrides))
      if (!error) {
        setAutoSaved(true)
        setTimeout(() => setAutoSaved(false), 2000)
      }
    }, 1000)
  }

  const handleSave = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaving(true)
    const error = await saveCheckin(user.id, today, buildPayload())
    setSaving(false)
    showToast(error ? 'Error saving — try again' : 'Check-in saved!')
  }, [user, today, checks, steps, walk, pain, sleep, score, showToast])

  function handleReset() {
    setChecks({})
    setSteps('')
    setWalk('')
    setPain(0)
    setSleep('')
    setScore(null)
    showToast('Reset for new day')
  }

  return (
    <>
      <Cover bgText="TODAY" label="Daily check-in — auto-resets every morning — under 2 minutes" />
      <div className="page-inner">
        <div className="page-icon">✅</div>
        <div className="page-title">Daily Check-In</div>
        <div className="page-sub">{dateStr}</div>

        <div className="callout callout-blue">
          <span className="callout-icon">💡</span>
          <div className="callout-content">
            <div className="callout-title">Auto-resets every morning</div>
            <div className="callout-text">Your check-in automatically resets at midnight each day. Your weekly data is saved separately so you never lose history. Just check things off as you go.</div>
          </div>
        </div>

        {/* Live stats */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card stat-green">
            <div className="stat-label">Supplements today</div>
            <div className="stat-value">{suppPct}%</div>
            <div className="stat-sub">{checkedCount} of {SUPP_KEYS.length} taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Steps</div>
            <div className="stat-value">{steps ? Number(steps).toLocaleString() : '—'}</div>
            <div className="stat-sub">Target: 8,000+</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pain level</div>
            <div className="stat-value" style={{ color: PAIN_COLORS[pain] }}>{pain}</div>
            <div className="stat-sub">{PAIN_LABELS[pain]}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sleep</div>
            <div className="stat-value">{sleep ? `${sleep}h` : '—'}</div>
            <div className="stat-sub">Target: 7.5–8.5 hrs</div>
          </div>
        </div>

        {/* Supplement sections */}
        {SUPP_SECTIONS.map(section => (
          <div key={section.id}>
            {section.id === 'pre' && (
              <>
                <div className="section-label">Pre-PT — 30–60 min before session 🔴 (PT days only)</div>
                <div className="callout callout-red" style={{ marginBottom: 8 }}>
                  <span className="callout-icon">⏱</span>
                  <div className="callout-content">
                    <div className="callout-title">Set a phone alarm</div>
                    <div className="callout-text">Take collagen + vitamin C exactly 30–60 minutes before your PT session at Vastas. Do not skip this on PT days.</div>
                  </div>
                </div>
              </>
            )}
            {section.id === 'morning' && <div className="section-label">Morning stack ☀️</div>}
            {section.id === 'midday' && <div className="section-label">Midday 🌿</div>}
            {section.id === 'night' && <div className="section-label">Night stack 🌙</div>}
            <div className="check-section">
              <div className={`check-section-header ${section.headerClass}`}>{section.header}</div>
              <div>
                {section.items.map(item => (
                  <div key={item.key} className="check-item" onClick={() => toggleCheck(item.key)}>
                    <div className={`ci-box${checks[item.key] ? ' checked' : ''}`}>
                      {checks[item.key] && (
                        <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, stroke: 'white', fill: 'none', strokeWidth: 3 }}>
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </div>
                    <span className="ci-label">{item.label}</span>
                    <span className="ci-dose">{item.dose}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="section-label">Movement &amp; recovery</div>
        <div className="step-card">
          <label>Steps today</label>
          <div className="step-input-row">
            <input type="number" value={steps} onChange={e => { setSteps(e.target.value); scheduleAutoSave({ steps: e.target.value }) }} placeholder="0" min="0" max="30000" />
            <span className="step-target">Target: 8,000+</span>
          </div>
        </div>
        <div className="step-card">
          <label>Walking time in shoe (minutes)</label>
          <div className="step-input-row">
            <input type="number" value={walk} onChange={e => { setWalk(e.target.value); scheduleAutoSave({ walk: e.target.value }) }} placeholder="0" min="0" max="120" />
            <span className="step-target">Build gradually per Vastas PT</span>
          </div>
        </div>
        <div className="step-card">
          <label>Pain level — Achilles (0 = none, 10 = severe)</label>
          <div className="pain-row">
            <input type="range" className="pain-slider" min="0" max="10" value={pain} onChange={e => { const v = parseInt(e.target.value); setPain(v); scheduleAutoSave({ pain: v }) }} />
            <span className="pain-value" style={{ color: PAIN_COLORS[pain] }}>{pain}</span>
            <span className="pain-label">{PAIN_LABELS[pain]}</span>
          </div>
        </div>
        <div className="step-card">
          <label>Sleep last night (hours)</label>
          <div className="step-input-row">
            <input type="number" value={sleep} onChange={e => { setSleep(e.target.value); scheduleAutoSave({ sleep: e.target.value }) }} placeholder="0" min="0" max="12" step="0.5" />
            <span className="step-target">Target: 7.5–8.5 hrs</span>
          </div>
        </div>

        <div className="section-label">Daily score</div>
        <div className="score-row">
          {[{n:1,l:'Off day'},{n:2,l:'Partial'},{n:3,l:'Solid'},{n:4,l:'Strong'},{n:5,l:'Perfect'}].map(({n,l}) => (
            <button key={n} className={`score-btn${score === n ? ' selected' : ''}`} onClick={() => { setScore(n); scheduleAutoSave({ score: n }) }}>
              <span className="score-num">{n}</span>{l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save check-in'}
          </button>
          <button className="save-btn secondary" onClick={handleReset}>Reset for new day</button>
          {autoSaved && (
            <span style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Auto-saved
            </span>
          )}
        </div>
      </div>
      <Toast visible={visible} msg={msg} />
    </>
  )
}
