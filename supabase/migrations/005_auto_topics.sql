-- ============================================
-- 推しポチ❤ お題自動生成（固定ループ）
-- Supabase SQL Editor にコピペして Run するだけ！
-- ============================================

-- ページ読み込み時に呼ばれる関数
-- 今日（JST）のお題が無ければ固定リストから自動生成
create or replace function ensure_daily_topics()
returns void
language plpgsql
security definer
as $$
declare
  jst_now timestamptz := now() at time zone 'Asia/Tokyo';
  today_date date := jst_now::date;
  today_start timestamptz := (today_date::text || ' 00:00:00+09')::timestamptz;
  tomorrow_start timestamptz := today_start + interval '1 day';
  existing_count int;
begin
  -- 今日のお題があるか確認
  select count(*) into existing_count
  from hourly_topics
  where starts_at >= today_start
    and starts_at < tomorrow_start;

  -- すでに存在すればスキップ
  if existing_count > 0 then
    return;
  end if;

  -- 固定お題リスト（24時間分）を挿入
  insert into hourly_topics (title, starts_at, ends_at, is_active) values
    ('深夜のひとりごと',     today_start + interval '0 hours',  today_start + interval '1 hours',  true),
    ('眠れない夜に',         today_start + interval '1 hours',  today_start + interval '2 hours',  true),
    ('真夜中の告白',         today_start + interval '2 hours',  today_start + interval '3 hours',  true),
    ('夜更かしの理由',       today_start + interval '3 hours',  today_start + interval '4 hours',  true),
    ('早起きさんへ',         today_start + interval '4 hours',  today_start + interval '5 hours',  true),
    ('朝焼けの空',           today_start + interval '5 hours',  today_start + interval '6 hours',  true),
    ('目覚めの一枚',         today_start + interval '6 hours',  today_start + interval '7 hours',  true),
    ('朝の一杯',             today_start + interval '7 hours',  today_start + interval '8 hours',  true),
    ('通勤・通学風景',       today_start + interval '8 hours',  today_start + interval '9 hours',  true),
    ('今日のデスク周り',     today_start + interval '9 hours',  today_start + interval '10 hours', true),
    ('午前のおやつ',         today_start + interval '10 hours', today_start + interval '11 hours', true),
    ('お昼ごはん',           today_start + interval '11 hours', today_start + interval '12 hours', true),
    ('午後のひととき',       today_start + interval '12 hours', today_start + interval '13 hours', true),
    ('推しグッズ自慢',       today_start + interval '13 hours', today_start + interval '14 hours', true),
    ('散歩で見つけたもの',   today_start + interval '14 hours', today_start + interval '15 hours', true),
    ('今日のおやつ',         today_start + interval '15 hours', today_start + interval '16 hours', true),
    ('夕焼けの空',           today_start + interval '16 hours', today_start + interval '17 hours', true),
    ('晩ごはん',             today_start + interval '17 hours', today_start + interval '18 hours', true),
    ('今日の推し活',         today_start + interval '18 hours', today_start + interval '19 hours', true),
    ('夜のリラックスタイム', today_start + interval '19 hours', today_start + interval '20 hours', true),
    ('今日のベストショット', today_start + interval '20 hours', today_start + interval '21 hours', true),
    ('寝る前の一枚',         today_start + interval '21 hours', today_start + interval '22 hours', true),
    ('深夜のお供',           today_start + interval '22 hours', today_start + interval '23 hours', true),
    ('今日のありがとう',     today_start + interval '23 hours', today_start + interval '24 hours', true);
end;
$$;

-- anon / authenticated ロールに実行権限を付与
grant execute on function ensure_daily_topics() to anon;
grant execute on function ensure_daily_topics() to authenticated;
