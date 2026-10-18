-- Run this once in Supabase: SQL Editor > New query > paste > Run

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  service text not null,
  option text not null,
  total numeric(8,2) not null,
  deposit numeric(8,2) not null,
  app text,
  handle text,
  nickname text,
  preferred_date date,
  preferred_time text,
  area text,
  book_with text,
  delivery text,
  notes text,
  request_text text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','paid','completed','cancelled')),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_idx on bookings(user_id, created_at desc);
create index if not exists bookings_status_idx on bookings(status, created_at desc);

-- Lock the tables down. No policies = the public anon key can read nothing.
-- Only the server (service role key, kept secret in Vercel) can access data.
alter table users enable row level security;
alter table bookings enable row level security;
