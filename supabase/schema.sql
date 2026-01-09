-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create notes table
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add index on user_id for fast lookups and RLS
create index if not exists idx_notes_user_id on public.notes(user_id);

-- Enable Row Level Security (RLS) on notes table
alter table public.notes enable row level security;

-- Policies

-- Users can read their own notes
create policy "Users can read their own notes"
on public.notes
for select
using (auth.uid() = user_id);

-- Users can create their own notes
create policy "Users can create their own notes"
on public.notes
for insert
with check (auth.uid() = user_id);

-- Users can update their own notes
create policy "Users can update their own notes"
on public.notes
for update
using (auth.uid() = user_id);

-- Users can delete their own notes
create policy "Users can delete their own notes"
on public.notes
for delete
using (auth.uid() = user_id);