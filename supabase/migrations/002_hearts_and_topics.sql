-- ============================================
-- 推しポチ❤ ハート＆お題システム
-- Supabase SQL Editor にコピペして Run するだけ！
-- ============================================

-- 1. お題テーブル（毎時間のテーマ）
create table if not exists hourly_topics (
  id uuid primary key default gen_random_uuid(),
  title varchar(100) not null,           -- お題テキスト（例：「今日のランチ」）
  starts_at timestamptz not null,        -- 開始時刻
  ends_at timestamptz not null,          -- 終了時刻（starts_at + 1時間）
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. ハート投票テーブル（誰がどの投稿に何個送ったか）
create table if not exists heart_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,   -- 投票したユーザー
  post_id uuid references posts(id) not null,         -- 投票先の投稿
  topic_id uuid references hourly_topics(id),          -- どのお題の時間帯か
  hearts integer not null default 1,                   -- 送ったハート数（1〜10）
  created_at timestamptz default now()
);

-- 3. postsテーブルにハートカウントとお題IDを追加
alter table posts add column if not exists heart_count integer default 0;
alter table posts add column if not exists topic_id uuid references hourly_topics(id);

-- ============================================
-- インデックス（検索を速くする）
-- ============================================
create index if not exists idx_heart_votes_post_id on heart_votes(post_id);
create index if not exists idx_heart_votes_user_id on heart_votes(user_id);
create index if not exists idx_heart_votes_topic_id on heart_votes(topic_id);
create index if not exists idx_hourly_topics_starts_at on hourly_topics(starts_at);
create index if not exists idx_posts_topic_id on posts(topic_id);

-- ============================================
-- RLS（セキュリティ）
-- ============================================

-- hourly_topics: 誰でも読める、書き込みは制限
alter table hourly_topics enable row level security;

create policy "誰でもお題を読める"
  on hourly_topics for select
  using (true);

-- heart_votes: 自分の投票は読める・作れる
alter table heart_votes enable row level security;

create policy "自分の投票を読める"
  on heart_votes for select
  using (auth.uid() = user_id);

create policy "ログインユーザーは投票できる"
  on heart_votes for insert
  with check (auth.uid() = user_id);

-- 全員が投票数を集計できるように（ランキング用）
create policy "投票数は誰でも集計できる"
  on heart_votes for select
  using (true);

-- ============================================
-- サンプルお題データ（今日の分）
-- ============================================
insert into hourly_topics (title, starts_at, ends_at) values
  ('朝の一杯', now()::date + interval '7 hours', now()::date + interval '8 hours'),
  ('通勤・通学風景', now()::date + interval '8 hours', now()::date + interval '9 hours'),
  ('今日のデスク周り', now()::date + interval '9 hours', now()::date + interval '10 hours'),
  ('おやつタイム', now()::date + interval '10 hours', now()::date + interval '11 hours'),
  ('お昼ごはん', now()::date + interval '11 hours', now()::date + interval '12 hours'),
  ('午後のひととき', now()::date + interval '12 hours', now()::date + interval '13 hours'),
  ('推しグッズ自慢', now()::date + interval '13 hours', now()::date + interval '14 hours'),
  ('散歩で見つけたもの', now()::date + interval '14 hours', now()::date + interval '15 hours'),
  ('今日のおやつ', now()::date + interval '15 hours', now()::date + interval '16 hours'),
  ('夕焼け', now()::date + interval '16 hours', now()::date + interval '17 hours'),
  ('晩ごはん', now()::date + interval '17 hours', now()::date + interval '18 hours'),
  ('今日の推し活', now()::date + interval '18 hours', now()::date + interval '19 hours'),
  ('夜のリラックスタイム', now()::date + interval '19 hours', now()::date + interval '20 hours'),
  ('今日のベストショット', now()::date + interval '20 hours', now()::date + interval '21 hours'),
  ('寝る前の一枚', now()::date + interval '21 hours', now()::date + interval '22 hours'),
  ('深夜のお供', now()::date + interval '22 hours', now()::date + interval '23 hours'),
  ('真夜中の告白', now()::date + interval '23 hours', now()::date + interval '24 hours');
