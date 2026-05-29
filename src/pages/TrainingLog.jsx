import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'
import Cover from '../components/Cover'
import Toast, { useToast } from '../components/Toast'
import { loadTrainingWeek, saveTrainingDay } from '../lib/db'

const PROGRAM = [
  { day: 'Monday',    focus: 'upper',    focusLabel: 'Upper Push',       icon: '💪', exercises: [
    { name: 'Incline DB Press',               sets: '4×8–10' },
    { name: 'Seated Shoulder Press (machine)', sets: '3×10' },
    { name: 'Cable Chest Fly',                sets: '3×12' },
    { name: 'Triceps Pushdowns',              sets: '3×12' },
    { name: 'Lateral Raises',                 sets: '3×12' },
    { name: 'Dead Bugs (core)',               sets: '3×12' },
  ]},
  { day: 'Tuesday',   focus: 'lower',    focusLabel: 'Lower Body',       icon: '🦵', exercises: [
    { name: 'DB Romanian Deadlift',    sets: '3×12',          desc: 'Stand with DBs in front of thighs. Hinge at hips, pushing them back, lowering DBs along legs until hamstrings are fully stretched. Drive hips forward to stand. Keep back flat throughout.' },
    { name: 'DB Goblet Squat',         sets: '3×12 slow',     desc: 'Hold one DB at chest with both hands. Squat down on a 3-count, pause briefly at bottom, drive up through heels. Elbows track inside knees. Keep chest up.' },
    { name: 'Glute Bridge with DB',    sets: '4×15',          desc: 'Lie on back, knees bent, one DB across hips. Drive hips to ceiling, squeeze glutes hard at the top. Hold 1 second. Lower slowly. Core braced the whole time.' },
    { name: 'DB Sumo Squat',           sets: '3×12',          desc: 'Wide stance, toes angled out ~45°. Hold one DB vertically between legs with both hands. Squat keeping chest tall and knees tracking over toes. Targets inner thighs and glutes.' },
    { name: 'DB Hamstring Curl (lying)', sets: '3×12',        desc: 'Lie face down on a bench or floor. Hold a DB between your feet, gripped at the ankles. Curl heels toward glutes and lower slowly. If awkward on floor, use an ankle weight instead.' },
    { name: 'Banded Clamshells',       sets: '3×15 each side', desc: 'Lie on side, band just above knees, hips stacked, knees bent. Keep feet together and rotate the top knee up toward the ceiling. Don\'t let hips rock back. Pause and squeeze at top.' },
  ]},
  { day: 'Wednesday', focus: 'recovery', focusLabel: 'Active Recovery',  icon: '🚶', exercises: [
    { name: 'Walking in shoe — build per PT', sets: 'Per Vastas' },
    { name: 'Stationary bike (optional)',     sets: '20–25 min' },
    { name: 'Hip / hamstring mobility',       sets: '15 min' },
    { name: 'Ankle ROM — cleared range only', sets: 'Per PT' },
    { name: 'Foam rolling (avoid Achilles)',  sets: '10 min' },
  ]},
  { day: 'Thursday',  focus: 'upper',    focusLabel: 'Upper Pull',       icon: '💪', exercises: [
    { name: 'Dumbbell Row',         sets: '4×10 each arm', desc: 'Brace one knee and hand on bench. Pull DB to hip, elbow close to body. Full stretch at bottom, squeeze at top.' },
    { name: 'Rear Delt Fly',        sets: '3×15',          desc: 'Hinge forward at hips, DBs hanging. Raise arms out to sides with a slight bend in elbows — squeeze shoulder blades together at top.' },
    { name: 'Dumbbell Curl',        sets: '3×12',          desc: 'Standing, palms forward. Curl both DBs together. Full range — all the way down, full squeeze at top. No swinging.' },
    { name: 'Hammer Curl',          sets: '2×12',          desc: 'Same as curl but palms face each other throughout. Targets brachialis and brachioradialis for arm thickness.' },
    { name: 'Dumbbell Pullover',    sets: '3×12',          desc: 'Lie across bench with upper back supported, hips low. Hold one DB overhead with both hands, lower behind head, pull back over chest. Great lat stretch.' },
    { name: 'Dead Bug',             sets: '3×10 each side', desc: 'Flat on back, arms straight up, knees at 90°. Slowly lower opposite arm + leg toward floor while pressing lower back down. Return and switch.' },
  ]},
  { day: 'Friday',    focus: 'lower',    focusLabel: 'Lower + Core',     icon: '🏋️', exercises: [
    { name: 'DB Step-Up',              sets: '3×10 each leg', desc: 'If cleared by PT. Hold DBs at sides. Step one foot onto a sturdy box or step and drive through that heel to stand. Lower slowly. Don\'t push off the back foot.' },
    { name: 'DB Split Squat',          sets: '3×10 each leg', desc: 'Bodyweight only — no DBs until Achilles is fully cleared. Front foot flat, back foot on floor or slightly elevated. Lower the back knee toward the floor, keeping front shin vertical. Control the descent.' },
    { name: 'DB Lateral Lunge',        sets: '3×10 each side', desc: 'Hold DBs at sides. Step wide to one side, sitting back into that hip while keeping the other leg straight. Push back to center through the bent heel. Targets glutes and inner thighs.' },
    { name: 'Plank',                   sets: '3×45–60 sec',  desc: 'Forearms on the floor, body in a straight line from head to heels. Brace core, squeeze glutes. Don\'t let hips sag or pike. Breathe steadily.' },
    { name: 'Dead Bug',                sets: '3×10 each side', desc: 'Flat on back, arms straight up, knees at 90°. Press lower back into the floor. Slowly lower one arm and the opposite leg toward the floor. Return and switch sides.' },
    { name: 'Banded Lateral Walks',    sets: '3×15 each way', desc: 'Band just above knees. Slight squat position throughout. Step sideways keeping tension in the band at all times — don\'t let feet come together. 15 steps each direction.' },
  ]},
  { day: 'Saturday',  focus: 'cardio',   focusLabel: 'Zone 2 Cardio',   icon: '🚴', exercises: [
    { name: 'Stationary bike (preferred)',     sets: '30–40 min' },
    { name: 'Rowing machine (light)',          sets: '25–35 min' },
    { name: 'Conversational pace throughout', sets: '' },
  ]},
  { day: 'Sunday',    focus: 'rest',     focusLabel: 'Full Rest',        icon: '😴', exercises: [
    { name: 'Light walking only',             sets: '' },
    { name: 'This is where healing happens',  sets: '' },
  ]},
]

const FOCUS_CLASS = { upper: 'focus-upper', lower: 'focus-lower', recovery: 'focus-recovery', cardio: 'focus-cardio', rest: 'focus-rest' }

export default function TrainingLog() {
  const { user } = useAuth()
  const { visible, msg, showToast } = useToast()
  const [week, setWeek] = useState(1)
  const [weekData, setWeekData] = useState({})
  const [openDay, setOpenDay] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadTrainingWeek(user.id, week).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.day_index] = { exercises: r.exercises_completed || {}, notes: r.session_notes || '' } })
      setWeekData(map)
    })
  }, [user, week])

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
            <div className="callout-text">No jumping, running, or explosive movements. No aggressive calf stretching. No loaded ankle plantar-flexion unless cleared by Vastas. Pain ≤ 3/10 at all times. Stop if sharp Achilles pain.</div>
          </div>
        </div>

        <div className="section-label">Weekly overview</div>
        <div className="training-week-header">
          <div className="week-nav">
            <button className="week-nav-btn" onClick={() => setWeek(w => Math.max(1, w - 1))}>← Prev</button>
            <span className="week-label">Week {week}</span>
            <button className="week-nav-btn" onClick={() => setWeek(w => Math.min(8, w + 1))}>Next →</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>8-week protocol</div>
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
                    <div key={ei} className="exercise-row" style={{ alignItems: ex.desc ? 'flex-start' : 'center' }}>
                      <div
                        className={`ex-check${dayData.exercises[`ex_${ei}`] ? ' done' : ''}`}
                        style={{ marginTop: ex.desc ? 2 : 0 }}
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
            <div className="phase-title">Weeks 1–2</div>
            <div className="phase-weeks">Current — Post-op wk 7–8 — 60% effort</div>
            <ul className="phase-list">
              <li>Focus on form — no ego on weights</li>
              <li>Walking: build 5–15 min/day in shoe</li>
              <li>Zero Achilles pain during or after</li>
              <li>Collagen + Vitamin C starts now</li>
            </ul>
          </div>
          <div className="phase-card">
            <div className="phase-title">Weeks 3–5</div>
            <div className="phase-weeks">Strength rebuilding — 70% effort</div>
            <ul className="phase-list">
              <li>Increase weights 5–10% where pain is zero</li>
              <li>Walking: build to 20–30 min/day</li>
              <li>Step target: 6,000–8,000/day</li>
              <li>Zone 2 cardio up to 40 min</li>
            </ul>
          </div>
          <div className="phase-card">
            <div className="phase-title">Weeks 6–8</div>
            <div className="phase-weeks">Controlled progression — 75–80% effort</div>
            <ul className="phase-list">
              <li>Continue gradual load increase</li>
              <li>Eccentric calf loading ONLY if cleared</li>
              <li>Reassess with UVM Sports Medicine</li>
              <li>DexaFit Burlington scan</li>
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
