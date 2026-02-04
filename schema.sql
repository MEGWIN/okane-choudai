-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (extends Supabase auth.users)
-- Note: We will handle user profiles in 'public.users' linked to 'auth.users'
create table public.users (
  id uuid references auth.users not null primary key,
  display_name text,
  avatar_url text,
  paypay_id text,
  is_pro boolean default false,
  pro_expires_at timestamp with time zone,
  is_verified_adult boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Posts Table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  image_url text not null,
  caption text,
  expires_at timestamp with time zone not null,
  is_active boolean default true,
  heart_count integer default 0,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Donations Log (Platform Tips & copy logs)
create table public.donations (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id),
  donor_id uuid references public.users(id), -- Nullable if anonymous (though app might require login)
  recipient_id uuid references public.users(id) not null,
  amount integer not null, -- 10, 100, 500
  status text default 'pending', -- 'clicked_copy', 'verified' (hard to verify without API)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies (Security)
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.donations enable row level security;

-- Users policies
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Posts policies
create policy "Active posts are viewable by everyone."
  on public.posts for select
  using ( is_active = true );

create policy "Users can insert their own posts."
  on public.posts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own posts."
  on public.posts for update
  using ( auth.uid() = user_id );

-- Storage Bucket Setup (Image uploads)
-- You'll need to create a bucket named 'posts' in the Supabase Dashboard > Storage
-- Policy: Give public read access, authenticated insert access
