-- ============================================
-- 推しポチ❤ 招待（リファラル）システム
-- Supabase SQL Editor にコピペして Run するだけ！
-- ============================================

-- 1. usersテーブルに招待関連カラムを追加
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code varchar(8) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.users(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bonus_hearts integer DEFAULT 0;

-- 2. 招待ログテーブル
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid REFERENCES public.users(id) NOT NULL,
  invitee_id uuid REFERENCES public.users(id) NOT NULL,
  bonus_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(invitee_id)  -- 1人が招待される回数は1回まで
);

-- 3. インデックス
CREATE INDEX IF NOT EXISTS idx_referrals_inviter_id ON public.referrals(inviter_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- 4. RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分の招待履歴を読める"
  ON public.referrals FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "ログインユーザーは招待レコードを作れる"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = invitee_id);
