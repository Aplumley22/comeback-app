import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadTrainingWeek, saveTrainingDay, loadHeelRaiseTotal, addHeelRaises } from '../lib/db'

const PROTOCOL_START = new Date('2026-06-02')

function calcCurrentWeek() {
  const diffMs = Date.now() - PROTOCOL_START.getTime()
  return Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1)
}

const PROGRAM = [
  { day: 'Monday',    focus: 'upper',    focusLabel: 'Upper Push',      icon: '💪', exercises: [
    { name: 'DB Incline Press',             sets: '5×8–10',         desc: 'Set bench to 30–45°. Grip DBs at chest height, press up and slightly inward, lower with control. Full range — deep stretch at bottom, don\'t lock out fully at top.' },
    { name: 'DB Shoulder Press',            sets: '4×10',           desc: 'Sit upright, DBs at shoulder height, palms forward. Press overhead until arms are nearly straight, lower back to shoulders with control. Keep core braced — no arching.' },
    { name: 'DB Chest Fly',                 sets: '4×12',           desc: 'Lie on flat bench, DBs above chest with slight bend in elbows. Lower arms out wide in an arc until you feel a deep chest stretch. Drive back up squeezing the chest. Keep the elbow angle constant.' },
    { name: 'DB Tricep Overhead Extension', sets: '3×12',           desc: 'Sit or stand, hold one DB with both hands overhead. Lower behind your head by bending elbows — keep elbows pointing forward and close together. Press back up to full extension. Targets the long head of the tricep.' },
    { name: 'DB Lateral Raise',             sets: '3×12',           desc: 'Stand with DBs at sides. Raise arms out to sides to shoulder height — lead with elbows, slight bend. Lower slowly. Don\'t swing or shrug. Control the descent for max stimulus.' },
    { name: 'Dead Bug',                     sets: '3×12',           desc: 'Flat on back, arms straight up, knees at 90°. Press lower back into the floor. Slowly lower one arm and opposite leg toward the floor. Return and switch sides.' },
  ]},
  { day: 'Tuesday',   focus: 'upper',    focusLabel: 'Upper Pull',      icon: '💪', exercises: [
    { name: 'DB Row',                       sets: '5×10 each arm',  desc: 'Brace one knee and same-side hand on bench. Pull DB to hip, elbow close to body. Full stretch at bottom — feel the lat lengthen. Squeeze hard at the top. No rotation.' },
    { name: 'DB Rear Delt Fly',             sets: '5×15',           desc: 'Hinge forward at hips, DBs hanging below chest. Raise arms out to sides with a slight bend in elbows, squeezing shoulder blades together at top. Lower slowly. Light weight, strict form.' },
    { name: 'DB Curl',                      sets: '3×12',           desc: 'Standing, palms forward. Curl both DBs from full extension to full squeeze. Don\'t swing. Lower all the way down each rep.' },
    { name: 'Hammer Curl',                  sets: '3×12',           desc: 'Same as curl but palms face each other throughout. Targets brachialis and brachioradialis for arm thickness.' },
    { name: 'DB Pullover',                  sets: '3×12',           desc: 'Lie across bench with upper back supported, hips low. Hold one DB overhead with both hands, lower behind head, pull back over chest. Great lat stretch.' },
    { name: 'Dead Bug',                     sets: '3×10 each side', desc: 'Flat on back, arms straight up, knees at 90°. Press lower back into the floor. Slowly lower one arm and opposite leg toward the floor. Return and switch.' },
  ]},
  { day: 'Wednesday', focus: 'recovery', focusLabel: 'Active Recovery', icon: '🚶', exercises: [
    { name: 'Walking in shoe — build per Vastas PT',      sets: 'Per PT' },
    { name: 'Light mobility — hips, hamstrings, ankles',  sets: '15 min' },
    { name: 'Band pull-aparts',                           sets: '3×15',   desc: 'Hold band with both hands shoulder-width apart, arms extended forward at chest height. Pull band apart moving hands out to sides, squeezing shoulder blades together. Return slowly. Great for posture and rear delts.' },
    { name: 'Foam rolling — avoid Achilles directly',     sets: '10 min' },
  ]},
  { day: 'Thursday',  focus: 'lower',    focusLabel: 'Lower Body',      icon: '🦵', exercises: [
    { name: 'DB Romanian Deadlift',         sets: '4×12',           desc: 'Stand with DBs in front of thighs. Hinge at hips, pushing them back, lowering DBs along legs until hamstrings are fully stretched. Drive hips forward to stand. Keep back flat throughout.' },
    { name: 'DB Goblet Squat',              sets: '4×12 slow',      desc: 'Hold one DB at chest with both hands. Squat down on a 3-count, pause briefly at bottom, drive up through heels. Elbows track inside knees. Keep chest up.' },
    { name: 'Glute Bridge with DB on bench', sets: '4×15',          desc: 'Lie on floor with feet elevated on bench, DB across hips. Drive hips to ceiling, squeeze glutes hard at top. Hold 1 second. Lower slowly. Feet on bench increases range and glute recruitment.' },
    { name: 'DB Sumo Squat',                sets: '3×12',           desc: 'Wide stance, toes angled out ~45°. Hold one DB vertically between legs with both hands. Squat keeping chest tall and knees tracking over toes. Targets inner thighs and glutes.' },
    { name: 'DB Hamstring Curl (lying)',     sets: '3×12',           desc: 'Lie face down on bench or floor. Hold a DB between your feet, gripped at the ankles. Curl heels toward glutes and lower slowly. Use an ankle weight if the DB is awkward.' },
    { name: 'Banded Clamshells',            sets: '3×15 each side', desc: 'Lie on side, band just above knees, hips stacked, knees bent. Keep feet together and rotate the top knee up toward the ceiling. Don\'t let hips rock back. Pause and squeeze at top.' },
    { name: 'Two-leg Calf Raise',           sets: '3×15',           desc: 'Stand on edge of bench with heels hanging off. Lower heels below bench level, then rise up on both feet. Full range of motion. Cleared — controlled and pain-free.', isCalfRaise: true },
  ]},
  { day: 'Friday',    focus: 'lower',    focusLabel: 'Lower + Core',    icon: '🏋️', exercises: [
    { name: 'DB Step-Up on bench',          sets: '3×10 each leg',  desc: 'If cleared by PT. Hold DBs at sides. Step one foot onto bench and drive through that heel to stand tall. Lower slowly — don\'t push off the back foot.' },
    { name: 'DB Split Squat',               sets: '3×10 each leg',  desc: 'Hold DBs at sides. Front foot flat, back foot on floor or slightly elevated. Lower the back knee toward the floor, keeping front shin vertical. Control the descent fully.' },
    { name: 'DB Lateral Lunge',             sets: '3×10 each side', desc: 'Hold DBs at sides. Step wide to one side, sitting back into that hip while keeping the other leg straight. Push back to center through the bent heel. Targets glutes and inner thighs.' },
    { name: 'Plank',                        sets: '3×45–60 sec',    desc: 'Forearms on the floor, body in a straight line from head to heels. Brace core, squeeze glutes. Don\'t let hips sag or pike. Breathe steadily.' },
    { name: 'Dead Bug',                     sets: '3×10 each side', desc: 'Flat on back, arms straight up, knees at 90°. Press lower back into the floor. Slowly lower one arm and the opposite leg toward the floor. Return and switch sides.' },
    { name: 'Banded Lateral Walks',         sets: '3×15 each way',  desc: 'Band just above knees. Slight squat position throughout. Step sideways keeping tension in the band at all times — don\'t let feet come together. 15 steps each direction.' },
  ]},
  { day: 'Saturday',  focus: 'cardio',   focusLabel: 'Zone 1 Cardio',  icon: '🚴', exercises: [
    { name: 'Peloton Zone 1 ride',          sets: '45–60 min',      desc: 'PRIMARY. Target HR 110–120 bpm based on Polar data. Easy aerobic — fully conversational throughout. Recovery-paced cardio building the aerobic base for triathlon.' },
    { name: 'Brisk walking',                sets: '30–45 min',      desc: 'Alternative if Peloton not available. Brisk enough to elevate HR to 100–115 bpm. Flat terrain preferred to limit Achilles load.' },
  ]},
  { day: 'Sunday',    focus: 'rest',     focusLabel: 'Full Rest',       icon: '😴', exercises: [
    { name: 'Light walking only', sets: '' },
  ]},
]

const FOCUS_CLASS = { upper: 'focus-upper', lower: 'focus-lower', recovery: 'focus-recovery', cardio: 'focus-cardio', rest: 'focus-rest' }

export default function TrainingLog() {
  const { user } = useAuth()
  const { visible, msg, showToast } = useToast()
  const [week, setWeek] = useState(calcCurrentWeek)
  const [weekData, setWeekData] = useState({})
  const [openDay, setOpenDay] = useState(null)
  const [saving, setSaving] = useState(false)
  const [heelRaiseTotal, setHeelRaiseTotal] = useState(0)
  const [heelRaiseInputs, setHeelRaiseInputs] = useState({})
  const [heelRaiseLogged, setHeelRaiseLogged] = useState({})

  useEffect(() => {
    if (!user) return
    loadTrainingWeek(user.id, week).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.day_index] = { exercises: r.exercises_completed || {}, notes: r.session_notes || '' } })
      setWeekData(map)
    })
  }, [user, week])

  useEffect(() => {
    if (!user) return
    loadHeelRaiseTotal(user.id).then(total => setHeelRaiseTotal(total))
  }, [user])

  function getDayData(di) {
    return weekData[di] || { exercises: {}, notes: '' }
  }

  async function toggleExercise(di, ei) {
    const prev = getDayData(di)
    const exercises = { ...prev.exercises, [`ex_${ei}`]: !prev.exercises[`ex_${ei}`] }
    const updated = { ...prev, exercises }
    setWeekData(p => ({ ...p, [di]: updated }))
    await saveTrainingDay(user.id, week, di, exercises, updated.notes)
  }

  async function handleNoteChange(di, val) {
    const prev = getDayData(di)
    const updated = { ...prev, notes: val }
    setWeekData(p => ({ ...p, [di]: updated }))
    await saveTrainingDay(user.id, week, di, prev.exercises, val)
  }

  async function handleLogHeelRaises(di, ei) {
    const key = `${di}-${ei}`
    const reps = parseInt(heelRaiseInputs[key])
    if (!reps || reps <= 0) return
    const { error, total } = await addHeelRaises(user.id, reps)
    if (!error) {
      setHeelRaiseTotal(total)
      setHeelRaiseLogged(prev => ({ ...prev, [key]: reps }))
      setHeelRaiseInputs(prev => ({ ...prev, [key]: '' }))
      showToast(`+${reps} reps — ${total.toLocaleString()} / 10,000 total`)
    }
  }

  function toggleAccordion(di) {
    setOpenDay(openDay === di ? null : di)
  }

  const isDayCompleted = (di) => {
    const d = PROGRAM[di]
    if (d.focus === 'rest') return false
    const dayData = getDayData(di)
    return d.exercises.every((_, ei) => dayData.exercises[`ex_${ei}`])
  }

  const hasSomeChecked = (di) => {
    const dayData = getDayData(di)
    return Object.values(dayData.exercises).some(v => v)
  }

  return (
    <>
      <Cover bgText="TRAIN" label="Training log — track daily sessions + weekly progress" />
      <div className="page-inner">
        <div className="page-icon">🏋️</div>
        <div className="page-title">Training Log</div>
        <div className="page-sub">Check off exercises as you complete them. Notes save automatically. Navigate weeks to see history.</div>

        <div className="callout callout-red">
          <span className="callout-icon">🛑</span>
          <div className="callout-content">
            <div className="callout-title">Hard stops — read before every session</div>
            <div className="callout-text">No single leg calf raises yet. No running or jumping. Pain ≤ 3/10 at all times — stop immediately if it spikes.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(82,183,136,0.06)', border: '1px solid var(--green-border)', borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--green)', lineHeight: 1 }}>{heelRaiseTotal.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>/ 10,000 heel raises · log reps when you check off calf raises below</span>
          <div style={{ marginLeft: 'auto', height: 6, width: 80, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round((heelRaiseTotal / 10000) * 100))}%`, background: 'var(--green)', borderRadius: 3 }} />
          </div>
        </div>

        <div className="section-label">Weekly overview</div>
        <div className="training-week-header">
          <div className="week-nav">
            <button className="week-nav-btn" onClick={() => setWeek(w => Math.max(1, w - 1))}>← Prev</button>
            <span className="week-label">Week {week}</span>
            <button className="week-nav-btn" onClick={() => setWeek(w => w + 1)}>Next →</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Ongoing protocol</div>
        </div>

        {/* Week strip */}
        <div className="week-summary-strip">
          {PROGRAM.map((d, di) => {
            const completed = d.focus !== 'rest' && isDayCompleted(di)
            return (
              <div key={di} className={`week-day-dot${completed ? ' completed' : ''}${d.focus === 'rest' ? ' rest' : ''}`}>
                <div className="week-day-name">{d.day.slice(0, 3)}</div>
                <div className="week-day-icon">{d.icon}</div>
              </div>
            )
          })}
        </div>

        {/* Day accordions */}
        {PROGRAM.map((d, di) => {
          const isOpen = openDay === di
          const allDone = isDayCompleted(di)
          const anyDone = hasSomeChecked(di)
          const dayData = getDayData(di)
          return (
            <div key={di} className="day-accordion">
              <div className="day-accordion-header" onClick={() => toggleAccordion(di)}>
                <div className={`day-acc-check${allDone && d.focus !== 'rest' ? ' done' : ''}`}>
                  {allDone && d.focus !== 'rest' && (
                    <svg viewBox="0 0 12 12" style={{ width: 8, height: 8, stroke: 'white', fill: 'none', strokeWidth: 3 }}>
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <span className="day-acc-name">{d.day}</span>
                <span className={`focus-tag ${FOCUS_CLASS[d.focus]}`} style={{ marginRight: 8 }}>{d.focusLabel}</span>
                <span className="day-acc-status">{anyDone && d.focus !== 'rest' ? 'In progress' : ''}</span>
                <span className={`day-acc-chevron${isOpen ? ' open' : ''}`}>▼</span>
              </div>
              {isOpen && (
                <div className="day-accordion-body">
                  {d.exercises.map((ex, ei) => (
                    <div key={ei} className="exercise-row" style={{ alignItems: (ex.desc || ex.isCalfRaise) ? 'flex-start' : 'center' }}>
                      <div
                        className={`ex-check${dayData.exercises[`ex_${ei}`] ? ' done' : ''}`}
                        style={{ marginTop: (ex.desc || ex.isCalfRaise) ? 2 : 0 }}
                        onClick={() => toggleExercise(di, ei)}
                      >
                        {dayData.exercises[`ex_${ei}`] && (
                          <svg viewBox="0 0 12 12" style={{ width: 8, height: 8, stroke: 'white', fill: 'none', strokeWidth: 3 }}>
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className="ex-name">{ex.name}</span>
                        {ex.desc && (
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, lineHeight: 1.5 }}>{ex.desc}</div>
                        )}
                        {ex.isCalfRaise && dayData.exercises[`ex_${ei}`] && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              placeholder="Reps done?"
                              value={heelRaiseInputs[`${di}-${ei}`] || ''}
                              onChange={e => setHeelRaiseInputs(prev => ({ ...prev, [`${di}-${ei}`]: e.target.value }))}
                              style={{ width: 110, padding: '4px 8px', fontSize: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', outline: 'none' }}
                            />
                            <button
                              onClick={() => handleLogHeelRaises(di, ei)}
                              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 700, background: 'var(--green)', border: 'none', borderRadius: 6, color: '#0d1117', cursor: 'pointer' }}
                            >
                              + Add to 10k
                            </button>
                            {heelRaiseLogged[`${di}-${ei}`] && (
                              <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ {heelRaiseLogged[`${di}-${ei}`]} logged</span>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{heelRaiseTotal.toLocaleString()} / 10,000</span>
                          </div>
                        )}
                      </div>
                      <span className="ex-sets" style={{ flexShrink: 0, marginLeft: 8 }}>{ex.sets}</span>
                    </div>
                  ))}
                  <div className="session-notes">
                    <label>Session notes</label>
                    <textarea
                      placeholder="How did it feel? Any pain? Weight used? Notes for next time..."
                      value={dayData.notes}
                      onChange={e => handleNoteChange(di, e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div className="divider" />
        <div className="section-label">8-week progression</div>
        <div className="phase-grid">
          <div className="phase-card current">
            <div className="phase-title">Weeks 1–2 of training</div>
            <div className="phase-weeks">Current — light weights, form focus, building habit</div>
            <ul className="phase-list">
              <li>Focus on form — no ego on weights</li>
              <li>Two-leg calf raises added — controlled and pain-free</li>
              <li>No single leg calf work yet</li>
              <li>Peloton Zone 2 sessions — HR 110–130</li>
            </ul>
          </div>
          <div className="phase-card">
            <div className="phase-title">Weeks 3–6</div>
            <div className="phase-weeks">Progressive overload — increase weight weekly</div>
            <ul className="phase-list">
              <li>Add 5–10% weight where pain stays at zero</li>
              <li>Progress two-leg calf raise — add weight/reps</li>
              <li>Introduce more volume — 4th sets where appropriate</li>
              <li>Zone 2 cardio up to 45 min</li>
            </ul>
          </div>
          <div className="phase-card">
            <div className="phase-title">Weeks 7–12</div>
            <div className="phase-weeks">Strength building — return to sport prep</div>
            <ul className="phase-list">
              <li>Single leg calf work when cleared by Vastas</li>
              <li>Reassess with UVM Sports Medicine</li>
              <li>DexaFit Burlington scan</li>
              <li>Return to sport — timeline TBD</li>
            </ul>
          </div>
        </div>

        <div className="callout callout-red">
          <span className="callout-icon">🚨</span>
          <div className="callout-content">
            <div className="callout-title">Red flags — stop immediately</div>
            <div className="callout-text">Sharp Achilles pain · Increased swelling · Limping returns · Pain &gt; 3/10 · Any popping or snapping</div>
          </div>
        </div>
      </div>
      <Toast visible={visible} msg={msg} />
    </>
  )
}
