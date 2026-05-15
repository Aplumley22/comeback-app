import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadWeeklyReview, saveWeeklyReview, logWeight, todayKey } from '../lib/db'

const WEEK_KEY = (() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`
})()

const NUMBER_FIELDS = [
  { id: 'workouts',    label: 'Workouts completed (target: 4–5)', placeholder: '0', type: 'number', max: 7 },
  { id: 'compliance',  label: 'Supplement compliance %', placeholder: '%', type: 'number', max: 100 },
  { id: 'avg_steps',   label: 'Average daily steps', placeholder: '0', type: 'number' },
  { id: 'avg_sleep',   label: 'Average sleep (hours)', placeholder: '0', type: 'number', step: 0.5 },
  { id: 'avg_pain',    label: 'Average pain level (0–10)', placeholder: '0', type: 'number', max: 10, step: 0.5 },
  { id: 'pt_sessions', label: 'PT sessions attended', placeholder: '0', type: 'number', max: 7 },
  { id: 'weight',      label: 'Weight this week (lbs)', placeholder: '230', type: 'number' },
  { id: 'collagen_days', label: 'Pre-PT collagen protocol (days/PT days)', placeholder: 'e.g. 3/3', type: 'text' },
]

const ACHILLES_FIELDS = [
  { id: 'sharp_pain',        label: 'Any sharp pain this week?',        placeholder: 'Yes / No' },
  { id: 'swelling',          label: 'Any swelling increase?',           placeholder: 'Yes / No' },
  { id: 'walking_improving', label: 'Walking improving vs last week?',  placeholder: 'Yes / No / Same' },
  { id: 'pt_feedback',       label: 'PT feedback this week',            placeholder: 'Notes from Vastas...' },
]

const REFLECTION_FIELDS = [
  { id: 'whats_working',      label: "What's working",                              placeholder: 'What went well this week...' },
  { id: 'whats_not',          label: "What's not working",                          placeholder: 'What got in the way...' },
  { id: 'one_lever',          label: 'One lever to pull next week',                 placeholder: "The single thing I'm focusing on improving..." },
  { id: 'appointment_notes',  label: 'Notes for Vastas / UVM Sports Med appointment', placeholder: 'Things to mention at next appointment...' },
]

export default function WeeklyReview() {
  const { user } = useAuth()
  const { visible, msg, showToast } = useToast()
  const [fields, setFields] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadWeeklyReview(user.id, WEEK_KEY).then(data => {
      if (data) setFields(data)
    })
  }, [user])

  function set(id, val) {
    setFields(prev => ({ ...prev, [id]: val }))
  }

  async function handleSave() {
    setSaving(true)
    const { weight, ...rest } = fields
    const error = await saveWeeklyReview(user.id, WEEK_KEY, fields)
    if (!error && weight && !isNaN(weight)) {
      await logWeight(user.id, todayKey(), parseFloat(weight))
    }
    setSaving(false)
    showToast(error ? 'Error saving — try again' : 'Weekly review saved!')
  }

  function inputStyle(multiline) {
    return {
      width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '8px 12px', color: 'var(--text)',
      fontFamily: 'DM Sans', fontSize: 13, outline: 'none',
      ...(multiline ? { resize: 'vertical', minHeight: 80 } : {})
    }
  }

  return (
    <>
      <Cover bgText="WEEKLY" label="Weekly review — every Sunday — 10–15 minutes" />
      <div className="page-inner">
        <div className="page-icon">📊</div>
        <div className="page-title">Weekly Review</div>
        <div className="page-sub">Every Sunday. This is where you learn what's working and set the lever for next week.</div>

        <div className="section-label">Weekly numbers</div>
        <div className="weekly-grid">
          {NUMBER_FIELDS.map(f => (
            <div key={f.id} className="weekly-card">
              <label>{f.label}</label>
              <input
                type={f.type || 'text'}
                value={fields[f.id] ?? ''}
                onChange={e => set(f.id, e.target.value)}
                placeholder={f.placeholder}
                min={0}
                max={f.max}
                step={f.step}
                style={inputStyle(false)}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>

        <div className="section-label">Achilles check-in</div>
        <div className="weekly-grid">
          {ACHILLES_FIELDS.map(f => (
            <div key={f.id} className="weekly-card">
              <label>{f.label}</label>
              <input
                type="text"
                value={fields[f.id] ?? ''}
                onChange={e => set(f.id, e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle(false)}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>

        <div className="section-label">Reflection</div>
        {REFLECTION_FIELDS.map(f => (
          <div key={f.id} className="weekly-card" style={{ marginBottom: 12 }}>
            <label>{f.label}</label>
            <textarea
              value={fields[f.id] ?? ''}
              onChange={e => set(f.id, e.target.value)}
              placeholder={f.placeholder}
              style={inputStyle(true)}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save weekly review'}
        </button>
      </div>
      <Toast visible={visible} msg={msg} />
    </>
  )
}
