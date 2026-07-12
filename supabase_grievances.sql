-- Run this SQL in your Supabase SQL Editor to set up the grievances table,
-- row-level security (RLS) policies, and realtime synchronization.

-- 1. Create grievances table
create table if not exists public.grievances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text,
  urgency text default 'medium',
  status text default 'pending', -- pending, in_review, resolved
  raw_input text,
  drafted_complaint text,
  submission_steps jsonb,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.grievances enable row level security;

-- 3. Create policies for data security
create policy "Users can view their own grievances" on public.grievances
  for select using (auth.uid() = user_id);

create policy "Users can insert their own grievances" on public.grievances
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own grievances" on public.grievances
  for update using (auth.uid() = user_id);

-- 4. Enable Realtime updates for grievances tracking
alter publication supabase_realtime add table public.grievances;
