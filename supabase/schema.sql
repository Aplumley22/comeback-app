-- Andrew's Comeback Protocol — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─────────────────────────────────────────────
-- DAILY CHECK-INS
-- ─────────────────────────────────────────────
create table if not exists daily_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  creatine boolean default false,
  omega3 boolean default false,
  d3k2 boolean default false,
  lionsmane boolean default false,
  avmacol boolean default false,
  protein boolean default false,
  collagen boolean default false,
  vitc boolean default false,
  mag boolean default false,
  ashwa boolean default false,
  steps integer,
  walk_time integer,
  pain_level integer default 0,
  sleep_hours numeric(3,1),
  daily_score integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);
alter table daily_checkins enable row level security;
create policy "Users manage own checkins"
  on daily_checkins for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- WEEKLY REVIEWS
-- ─────────────────────────────────────────────
create table if not exists weekly_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  week_key date not null,
  workouts integer,
  compliance integer,
  avg_steps integer,
  avg_sleep numeric(3,1),
  avg_pain numeric(3,1),
  pt_sessions integer,
  weight numeric(5,1),
  collagen_days text,
  sharp_pain text,
  swelling text,
  walking_improving text,
  pt_feedback text,
  whats_working text,
  whats_not text,
  one_lever text,
  appointment_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_key)
);
alter table weekly_reviews enable row level security;
create policy "Users manage own weekly reviews"
  on weekly_reviews for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- WEIGHT LOG
-- ─────────────────────────────────────────────
create table if not exists weight_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  weight numeric(5,1) not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);
alter table weight_log enable row level security;
create policy "Users manage own weight log"
  on weight_log for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TRAINING LOG
-- ─────────────────────────────────────────────
create table if not exists training_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  week_number integer not null,
  day_index integer not null,
  exercises_completed jsonb default '{}',
  session_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_number, day_index)
);
alter table training_log enable row level security;
create policy "Users manage own training log"
  on training_log for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- MILESTONES
-- ─────────────────────────────────────────────
create table if not exists milestones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  milestone_key text not null,
  completed_date date not null,
  created_at timestamptz default now(),
  unique(user_id, milestone_key)
);
alter table milestones enable row level security;
create policy "Users manage own milestones"
  on milestones for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- LAB TESTS
-- ─────────────────────────────────────────────
create table if not exists lab_tests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  test_name text not null,
  status text default 'pending',
  result text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, test_name)
);
alter table lab_tests enable row level security;
create policy "Users manage own lab tests"
  on lab_tests for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- POLAR SESSIONS
-- ─────────────────────────────────────────────
create table if not exists polar_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  session_type text not null,
  duration_min integer not null,
  avg_hr integer,
  max_hr integer,
  calories integer,
  notes text,
  created_at timestamptz default now()
);
alter table polar_sessions enable row level security;
create policy "Users manage own polar sessions"
  on polar_sessions for all using (auth.uid() = user_id);
