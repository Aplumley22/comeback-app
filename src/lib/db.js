import { supabase } from './supabase'

export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ─── DAILY CHECK-INS ─────────────────────────
export async function loadCheckin(userId, date) {
  const { data } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()
  return data
}

export async function saveCheckin(userId, date, fields) {
  const { error } = await supabase
    .from('daily_checkins')
    .upsert({ user_id: userId, date, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id,date' })
  return error
}

// ─── WEIGHT LOG ───────────────────────────────
export async function loadWeightLog(userId) {
  const { data } = await supabase
    .from('weight_log')
    .select('date, weight')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  return data || []
}

export async function logWeight(userId, date, weight) {
  const { error } = await supabase
    .from('weight_log')
    .upsert({ user_id: userId, date, weight }, { onConflict: 'user_id,date' })
  return error
}

// ─── WEEKLY REVIEWS ───────────────────────────
export async function loadAllWeeklyReviews(userId) {
  const { data } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('week_key', { ascending: true })
  return data || []
}

export async function loadWeeklyReview(userId, weekKey) {
  const { data } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('week_key', weekKey)
    .maybeSingle()
  return data
}

export async function saveWeeklyReview(userId, weekKey, fields) {
  const { error } = await supabase
    .from('weekly_reviews')
    .upsert({ user_id: userId, week_key: weekKey, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id,week_key' })
  return error
}

// ─── TRAINING LOG ─────────────────────────────
export async function loadTrainingWeek(userId, weekNumber) {
  const { data } = await supabase
    .from('training_log')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
  return data || []
}

export async function saveTrainingDay(userId, weekNumber, dayIndex, exercisesCompleted, sessionNotes) {
  const { error } = await supabase
    .from('training_log')
    .upsert(
      { user_id: userId, week_number: weekNumber, day_index: dayIndex, exercises_completed: exercisesCompleted, session_notes: sessionNotes, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,week_number,day_index' }
    )
  return error
}

// ─── MILESTONES ───────────────────────────────
export async function loadMilestones(userId) {
  const { data } = await supabase
    .from('milestones')
    .select('milestone_key, completed_date')
    .eq('user_id', userId)
  return data || []
}

export async function completeMilestone(userId, milestoneKey) {
  const { error } = await supabase
    .from('milestones')
    .upsert({ user_id: userId, milestone_key: milestoneKey, completed_date: todayKey() }, { onConflict: 'user_id,milestone_key' })
  return error
}

// ─── LAB TESTS ────────────────────────────────
export async function loadLabTests(userId) {
  const { data } = await supabase
    .from('lab_tests')
    .select('test_name, status, result')
    .eq('user_id', userId)
  return data || []
}

export async function saveLabTest(userId, testName, status, result) {
  const { error } = await supabase
    .from('lab_tests')
    .upsert({ user_id: userId, test_name: testName, status, result, updated_at: new Date().toISOString() }, { onConflict: 'user_id,test_name' })
  return error
}

// ─── CHECKIN STATS (last 7 days for compliance rings) ──
export async function loadRecentCheckins(userId) {
  const { data } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(7)
  return data || []
}
