-- =========================================================================
-- SkillStream Learning Platform - Supabase PostgreSQL Schema
-- Project: cksbfdfteqqsngdbfvte
-- Paste and run this script in your Supabase Dashboard: SQL Editor -> New query -> Run
-- =========================================================================

-- 1. COURSES TABLE
create table if not exists public.courses (
  id text primary key,
  slug text unique not null,
  title text not null,
  short_description text default '',
  full_description text default '',
  thumbnail text default '',
  category text default 'General',
  level text default 'All Levels',
  status text default 'published',
  instructor_name text default '',
  instructor_image text default '',
  course_introduction text default '',
  learning_outcomes jsonb default '[]'::jsonb,
  featured boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SECTIONS TABLE
create table if not exists public.sections (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text default '',
  display_order integer default 0,
  status text default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LESSONS TABLE
create table if not exists public.lessons (
  id text primary key,
  section_id text not null references public.sections(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text default '',
  video_type text default 'youtube',
  youtube_url text default '',
  youtube_video_id text default '',
  uploaded_video_url text default '',
  thumbnail text default '',
  duration text default '',
  lesson_number integer default 1,
  display_order integer default 0,
  free_preview boolean default false,
  status text default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PLAYLIST RECORDS TABLE
create table if not exists public.playlists (
  id text primary key,
  playlist_id text not null,
  title text not null,
  course_id text default '',
  course_title text default '',
  section_id text default '',
  section_title text default '',
  video_count integer default 0,
  imported_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_synced_at timestamp with time zone,
  status text default 'active',
  youtube_url text default ''
);

-- 5. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  admin_email text not null,
  action text not null,
  target_type text not null,
  target_title text not null,
  details text default ''
);

-- 6. APP USERS / ADMINISTRATORS TABLE
create table if not exists public.app_users (
  id text primary key,
  email text unique not null,
  name text default '',
  role text default 'admin',
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. PLATFORM SETTINGS TABLE
create table if not exists public.platform_settings (
  id text primary key default 'default',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES for fast lookup
create index if not exists idx_courses_slug on public.courses(slug);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_category on public.courses(category);
create index if not exists idx_sections_course_id on public.sections(course_id);
create index if not exists idx_lessons_section_id on public.lessons(section_id);
create index if not exists idx_lessons_course_id on public.lessons(course_id);
create index if not exists idx_playlists_playlist_id on public.playlists(playlist_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.lessons enable row level security;
alter table public.playlists enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_users enable row level security;
alter table public.platform_settings enable row level security;

-- CREATE RLS POLICIES (Allow public & API access with anon/service keys)
drop policy if exists "Public read courses" on public.courses;
create policy "Public read courses" on public.courses for select using (true);

drop policy if exists "Allow all courses for anon" on public.courses;
create policy "Allow all courses for anon" on public.courses for all using (true) with check (true);

drop policy if exists "Public read sections" on public.sections;
create policy "Public read sections" on public.sections for select using (true);

drop policy if exists "Allow all sections for anon" on public.sections;
create policy "Allow all sections for anon" on public.sections for all using (true) with check (true);

drop policy if exists "Public read lessons" on public.lessons;
create policy "Public read lessons" on public.lessons for select using (true);

drop policy if exists "Allow all lessons for anon" on public.lessons;
create policy "Allow all lessons for anon" on public.lessons for all using (true) with check (true);

drop policy if exists "Public read playlists" on public.playlists;
create policy "Public read playlists" on public.playlists for select using (true);

drop policy if exists "Allow all playlists for anon" on public.playlists;
create policy "Allow all playlists for anon" on public.playlists for all using (true) with check (true);

drop policy if exists "Allow all audit_logs for anon" on public.audit_logs;
create policy "Allow all audit_logs for anon" on public.audit_logs for all using (true) with check (true);

drop policy if exists "Allow all app_users for anon" on public.app_users;
create policy "Allow all app_users for anon" on public.app_users for all using (true) with check (true);

drop policy if exists "Allow all platform_settings for anon" on public.platform_settings;
create policy "Allow all platform_settings for anon" on public.platform_settings for all using (true) with check (true);
