import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadLabTests, saveLabTest } from '../lib/db'

const BLOODWORK = [
  { name: 'Testosterone — Total + Free + SHBG', target: 'Free T upper quartile' },
  { name: 'Vitamin D (25-OH)',                   target: '50–70 ng/mL' },
  { name: 'RBC Magnesium (not serum)',            target: 'Upper normal range' },
  { name: 'Full Thyroid — TSH, Free T3, Free T4, Reverse T3', target: 'Full panel — not just TSH' },
  { name: 'hsCRP (high-sensitivity inflammation)', target: '<1.0 mg/L' },
  { name: 'Comprehensive Metabolic Panel',         target: 'Glucose, liver, kidney, electrolytes' },
  { name: 'Lipids + ApoB',                         target: 'ApoB <80 mg/dL ideal' },
  { name: 'Omega-3 Index',                         target: '>8% — baseline before fish oil' },
  { name: 'HbA1c + Fasting Glucose',               target: 'HbA1c <5.7%' },
]

const BODY_COMP = [
  { name: 'DEXA Scan — body composition baseline', location: 'DexaFit Burlington — 30 Kimball Ave', notes: 'Book after week 8 — before training ramps' },
  { name: 'VO2 Max + Lactate Threshold',            location: 'DexaFit Burlington',                  notes: 'Phase 3 only — once cleared to run' },
]

const PROVIDERS = [
  { name: 'Vastas Physical Therapy',           role: 'Physical Therapy — Achilles Rehab',                       addr: 'Vermont',                          status: 'ps-active', statusLabel: 'Active' },
  { name: 'UVM Medical Center Sports Medicine', role: 'Achilles Follow-Up + Return-to-Sport Clearance',          addr: '192 Tilley Dr, South Burlington',   status: 'ps-active', statusLabel: 'Active' },
  { name: 'Preventive Medicine VT',             role: 'Functional Medicine + Advanced Bloodwork',                addr: 'Colchester, Vermont',               status: 'ps-book',   statusLabel: 'Book this week' },
  { name: 'DexaFit Burlington',                 role: 'DEXA Scan + VO2 Max + Metabolic Testing',                addr: '30 Kimball Ave, South Burlington',  status: 'ps-book',   statusLabel: 'Book after week 8' },
]

const STATUS_CYCLE = ['pending', 'ordered', 'done']
const STATUS_LABEL = { pending: 'Pending', ordered: 'Ordered', done: 'Done' }

export default function LabWork() {
  const { user } = useAuth()
  const { visible, msg, showToast } = useToast()
  const [labData, setLabData] = useState({})

  useEffect(() => {
    if (!user) return
    loadLabTests(user.id).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.test_name] = { status: r.status, result: r.result || '' } })
      setLabData(map)
    })
  }, [user])

  function getTest(name) {
    return labData[name] || { status: 'pending', result: '' }
  }

  async function cycleStatus(name) {
    const cur = getTest(name)
    const curIdx = STATUS_CYCLE.indexOf(cur.status)
    const next = STATUS_CYCLE[(curIdx + 1) % STATUS_CYCLE.length]
    setLabData(prev => ({ ...prev, [name]: { ...prev[name], status: next } }))
    await saveLabTest(user.id, name, next, cur.result || '')
  }

  async function updateResult(name, result) {
    const cur = getTest(name)
    setLabData(prev => ({ ...prev, [name]: { ...prev[name], result } }))
    await saveLabTest(user.id, name, cur.status, result)
  }

  return (
    <>
      <Cover bgText="LABS" label="Lab work & testing — Preventive Medicine VT + DexaFit Burlington" />
      <div className="page-inner">
        <div className="page-icon">🔬</div>
        <div className="page-title">Lab Work &amp; Testing</div>
        <div className="page-sub">Get these done at Preventive Medicine VT in Colchester. Ask for everything listed.</div>

        <div className="callout callout-amber">
          <span className="callout-icon">📞</span>
          <div className="callout-content">
            <div className="callout-title">Call this week — use this script</div>
            <div className="callout-text">"Hi, I'm looking to establish as a new patient. I'm a 37-year-old male, about 8 weeks post-op from an Achilles tendon repair, looking for a functional medicine physician for comprehensive bloodwork and long-term health optimization. Does Dr. [name] take new patients?"</div>
          </div>
        </div>

        <div className="section-label">Priority bloodwork — click status to update</div>
        <table className="lab-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Target</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {BLOODWORK.map(t => {
              const data = getTest(t.name)
              return (
                <tr key={t.name}>
                  <td>{t.name}</td>
                  <td>
                    <span
                      className={`status-pill status-${data.status}`}
                      onClick={() => cycleStatus(t.name)}
                    >
                      {STATUS_LABEL[data.status]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{t.target}</td>
                  <td>
                    <input
                      className="result-input"
                      placeholder="—"
                      value={data.result}
                      onChange={e => updateResult(t.name, e.target.value)}
                      onBlur={e => saveLabTest(user.id, t.name, data.status, e.target.value)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="section-label">Body composition testing</div>
        <table className="lab-table" style={{ marginBottom: 20 }}>
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Location</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {BODY_COMP.map(t => {
              const data = getTest(t.name)
              return (
                <tr key={t.name}>
                  <td>{t.name}</td>
                  <td>
                    <span
                      className={`status-pill status-${data.status}`}
                      onClick={() => cycleStatus(t.name)}
                    >
                      {STATUS_LABEL[data.status]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{t.location}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{t.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="section-label">Key providers</div>
        <div className="provider-grid">
          {PROVIDERS.map(p => (
            <div key={p.name} className="provider-card">
              <div className="provider-name">{p.name}</div>
              <div className="provider-role">{p.role}</div>
              <div className="provider-addr">{p.addr}</div>
              <span className={`provider-status ${p.status}`}>{p.statusLabel}</span>
            </div>
          ))}
        </div>
      </div>
      <Toast visible={visible} msg={msg} />
    </>
  )
}
