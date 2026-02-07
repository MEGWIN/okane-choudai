-- ============================================
-- 推しポチ❤ フォロー機能
-- Supabase SQL Editor にコピペして Run するだけ！
-- ============================================

-- フォローテーブル
create table if not exists follows (
  follower_id uuid references auth.users(id) not null,
  following_id uuid references public.users(id) not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- インデックス
create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);

-- RLS
alter table follows enable row level security;

create policy "自分のフォローを読める"
  on follows for select
  using (auth.uid() = follower_id);

create policy "ログインユーザーはフォローできる"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "自分のフォローを解除できる"
  on follows for delete
  using (auth.uid() = follower_id);
