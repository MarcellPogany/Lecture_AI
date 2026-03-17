-- ============================================================
-- LectureAI — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. USER PROFILES  (extends auth.users)
-- ──────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '',
  email         text not null default '',
  plan_tier     text not null default 'free' check (plan_tier in ('free', 'premium')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- 2. COURSES
-- ──────────────────────────────────────────────────────────
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  semester    text,
  professor   text,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 3. SESSIONS
-- ──────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  course_id        uuid references public.courses(id) on delete set null,
  title            text not null,
  course_tag       text not null default 'Uncategorized',
  input_type       text not null default 'record' check (input_type in ('upload', 'record', 'paste', 'url')),
  duration_seconds integer,
  language         text not null default 'en',
  summary_depth    text not null default 'standard' check (summary_depth in ('brief', 'standard', 'comprehensive')),
  status           text not null default 'pending' check (status in ('pending', 'transcribed', 'summarized', 'error')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 4. TRANSCRIPTS
-- ──────────────────────────────────────────────────────────
create table if not exists public.transcripts (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  raw_text    text not null default '',
  edited_text text,
  word_count  integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 5. SUMMARIES
-- ──────────────────────────────────────────────────────────
create table if not exists public.summaries (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  tldr             text,
  key_concepts     jsonb default '[]',
  section_summaries jsonb default '[]',
  glossary         jsonb default '[]',
  study_questions  jsonb default '[]',
  action_items     jsonb default '[]',
  created_at       timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 6. AUDIO FILES
-- ──────────────────────────────────────────────────────────
create table if not exists public.audio_files (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_type    text not null default 'original' check (file_type in ('original', 'tts_export')),
  mime_type    text not null,
  size_bytes   bigint,
  created_at   timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 7. FLASHCARD DECKS
-- ──────────────────────────────────────────────────────────
create table if not exists public.flashcard_decks (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  cards         jsonb default '[]',
  export_format text check (export_format in ('apkg', 'csv')),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.users          enable row level security;
alter table public.courses        enable row level security;
alter table public.sessions       enable row level security;
alter table public.transcripts    enable row level security;
alter table public.summaries      enable row level security;
alter table public.audio_files    enable row level security;
alter table public.flashcard_decks enable row level security;

-- ── users ────────────────────────────────────────────────
create policy "users: own row only" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ── courses ──────────────────────────────────────────────
create policy "courses: own rows only" on public.courses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── sessions ─────────────────────────────────────────────
create policy "sessions: own rows only" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── transcripts ───────────────────────────────────────────
create policy "transcripts: own rows only" on public.transcripts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── summaries ─────────────────────────────────────────────
create policy "summaries: own rows only" on public.summaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── audio_files ───────────────────────────────────────────
create policy "audio_files: own rows only" on public.audio_files
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── flashcard_decks ───────────────────────────────────────
create policy "flashcard_decks: own rows only" on public.flashcard_decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run this once — creates the private lecture-audio bucket
insert into storage.buckets (id, name, public)
values ('lecture-audio', 'lecture-audio', false)
on conflict (id) do nothing;

-- Storage RLS: users can only access their own folder
create policy "storage: own folder only" on storage.objects
  for all using (
    bucket_id = 'lecture-audio'
    and auth.uid()::text = split_part(name, '/', 1)
  )
  with check (
    bucket_id = 'lecture-audio'
    and auth.uid()::text = split_part(name, '/', 1)
  );
