# Supabase Setup Guide

To enable the Public Pinboard feature, you need to set up a Supabase project.

## 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Note down your `Project URL` and `anon` public key from the API settings.

## 2. Create the `public_photos` Table
Run the following SQL in the Supabase SQL Editor to create the table and enable storage if needed (though we are storing base64 in DB for simplicity for now, or you can use Storage).

**Note:** For this implementation, we will store the Base64 image data directly in the `data_url` column for simplicity. For production apps, you should use Supabase Storage.

```sql
create table public_photos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data_url text not null,
  caption text,
  frame_style text not null,
  timestamp bigint not null,
  prompt_used text
);

-- Enable Row Level Security (RLS)
alter table public_photos enable row level security;

-- Create a policy to allow anyone to insert (Pin)
create policy "Enable insert for everyone"
on public_photos for insert
with check (true);

-- Create a policy to allow anyone to read (Gallery)
create policy "Enable read for everyone"
on public_photos for select
using (true);
```

## 3. Configure Environment Variables
Add the following to your `.env` file (create one if it doesn't exist) or Vercel Environment Variables:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
