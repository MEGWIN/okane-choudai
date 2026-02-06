-- SNS連携カラムを追加（なりすまし対策用）
-- 実行方法: Supabase Dashboard > SQL Editor で実行

-- X (Twitter) 連携情報
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS x_username text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS x_avatar_url text;

-- TikTok 連携情報
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tiktok_username text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tiktok_avatar_url text;

-- SNS認証済みフラグ（X or TikTok と連携済みかどうか）
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_sns_verified boolean default false;

-- 認証プロバイダー（どのサービスでログインしたか）
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider text;

-- LINE 連携情報
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS line_user_id text;

-- コメント追加
COMMENT ON COLUMN public.users.x_username IS 'X (Twitter) ユーザー名（@なし）';
COMMENT ON COLUMN public.users.tiktok_username IS 'TikTok ユーザー名（@なし）';
COMMENT ON COLUMN public.users.is_sns_verified IS 'X or TikTok と連携済みの場合 true';
COMMENT ON COLUMN public.users.auth_provider IS 'ログインに使用したプロバイダー (google/line/x/tiktok)';
