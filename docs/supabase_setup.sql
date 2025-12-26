-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ASSESSMENT_CONFIGS (Central store for all scoring definitions)
create table public.assessment_configs (
  id uuid default uuid_generate_v4() primary key,
  version text not null default 'V1_MVP', 
  active boolean default true,
  
  -- JSONB storage of the client's config files:
  questions jsonb not null, 
  dimensions jsonb not null,
  archetypes jsonb not null, 
  microtypes jsonb not null, 
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RESPONSES (Raw User inputs)
create table public.responses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  config_version text not null, 
  raw_answers jsonb not null, -- Stores the exact payload: [ { "question_id": "Q1", "ranked_options": ["A", "C"] } ]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RESULTS (The Final Classified Output)
create table public.results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  response_id uuid references public.responses(id) not null,
  
  -- Scoring Result Payload (matches the required output of the scoring engine)
  user_vector jsonb not null, -- Normalized hidden vector
  microtype_id text not null,
  archetype_id text not null, -- e.g. "ARCH_ORGANIZER"
  microtype_tags text[], -- Array of strings
  distance_score numeric,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Optional but recommended)
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.assessment_configs enable row level security;
create policy "Anyone can view active configs" on public.assessment_configs for select using (active = true);
create policy "Anyone can insert configs" on public.assessment_configs for insert with check (true);

alter table public.responses enable row level security;
create policy "Users can view own responses" on public.responses for select using (auth.uid() = user_id);
create policy "Users can insert own responses" on public.responses for insert with check (auth.uid() = user_id);

alter table public.results enable row level security;
create policy "Users can view own results" on public.results for select using (auth.uid() = user_id);
create policy "Users can insert own results" on public.results for insert with check (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
