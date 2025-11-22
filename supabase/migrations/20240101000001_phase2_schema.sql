-- Create user_photos table
create table user_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data_url text not null,
  caption text,
  frame_style text not null default 'classic',
  filter_id text,
  pokemon_id text,
  prompt_used text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Indexes
create index idx_user_photos_user_id on user_photos(user_id);
create index idx_user_photos_created_at on user_photos(created_at desc);

-- RLS
alter table user_photos enable row level security;

create policy "Users can view own photos" on user_photos
  for select using (auth.uid() = user_id);

create policy "Users can insert own photos" on user_photos
  for insert with check (auth.uid() = user_id);

create policy "Users can update own photos" on user_photos
  for update using (auth.uid() = user_id);

create policy "Users can delete own photos" on user_photos
  for delete using (auth.uid() = user_id);

-- Modify public_photos table
alter table public_photos
  add column user_id uuid references auth.users(id) on delete set null,
  add column source_photo_id uuid references user_photos(id) on delete set null;

create index idx_public_photos_user_id on public_photos(user_id);
