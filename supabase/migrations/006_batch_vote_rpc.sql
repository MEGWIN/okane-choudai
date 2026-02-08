-- ============================================
-- バッチ投票RPC関数 + リアルタイム有効化
-- ハート連射を高速化するため、1回のDB呼び出しで
-- vote挿入 + heart_count増加を原子的に実行
-- ============================================

-- RPC関数: まとめてハートを送る
create or replace function batch_vote_hearts(
  p_user_id uuid,
  p_post_id uuid,
  p_topic_id uuid,
  p_hearts integer
)
returns void
language plpgsql
security definer
as $$
begin
  -- 投票レコード挿入
  insert into heart_votes (user_id, post_id, topic_id, hearts)
  values (p_user_id, p_post_id, p_topic_id, p_hearts);

  -- heart_countを原子的にインクリメント（競合なし）
  update posts
  set heart_count = coalesce(heart_count, 0) + p_hearts
  where id = p_post_id;
end;
$$;

-- postsテーブルのリアルタイムを有効化（ランキング即時反映用）
alter publication supabase_realtime add table posts;
