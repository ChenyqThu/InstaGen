-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  custom_gemini_key text,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- Create handle_new_user function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create user_usage table
create table if not exists public.user_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  usage_date date not null,
  gemini_calls integer default 0,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  constraint unique_user_date unique (user_id, usage_date)
);

-- Create index for user_usage
create index if not exists idx_user_usage_user_date on public.user_usage(user_id, usage_date);

-- Enable RLS for user_usage
alter table public.user_usage enable row level security;

-- Create policies for user_usage
create policy "Users can view own usage" on public.user_usage
  for select using (auth.uid() = user_id);
create policy "Users can insert own usage" on public.user_usage
  for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on public.user_usage
  for update using (auth.uid() = user_id);

-- Create increment_usage function
create or replace function public.increment_usage(p_user_id uuid, p_date date)
returns void as $$
begin
  insert into public.user_usage (user_id, usage_date, gemini_calls)
  values (p_user_id, p_date, 1)
  on conflict (user_id, usage_date)
  do update set gemini_calls = user_usage.gemini_calls + 1;
end;
$$ language plpgsql security definer;
