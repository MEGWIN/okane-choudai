'use client'

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="ac-card bg-[#fffacd]/95 p-6">
        <h1 className="text-2xl font-bold text-[#5d4e37] mb-6">プライバシーポリシー</h1>

        <div className="space-y-4 text-[#5d4e37]">
          <section>
            <h2 className="text-lg font-bold mb-2">1. 収集する情報</h2>
            <p className="text-sm leading-relaxed">
              本サービスでは、以下の情報を収集します：
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1 mt-2">
              <li>アカウント情報（メールアドレス、表示名、プロフィール画像）</li>
              <li>SNS連携情報（Google、LINE、X、TikTokのユーザー情報）</li>
              <li>投稿コンテンツ（画像、テキスト）</li>
              <li>PayPay ID（送金機能利用時）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. 情報の利用目的</h2>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
              <li>本サービスの提供・運営</li>
              <li>ユーザー認証・なりすまし防止</li>
              <li>サービス改善・新機能開発</li>
              <li>お問い合わせ対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. 情報の共有</h2>
            <p className="text-sm leading-relaxed">
              以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません：
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1 mt-2">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく開示請求があった場合</li>
              <li>サービス提供に必要な業務委託先（Supabase、Vercel等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. データの保存</h2>
            <p className="text-sm leading-relaxed">
              投稿コンテンツは1時間後に自動削除されます。
              アカウント情報はユーザーが削除を希望するまで保存されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Cookie・トラッキング</h2>
            <p className="text-sm leading-relaxed">
              本サービスでは、認証およびセッション管理のためにCookieを使用します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. セキュリティ</h2>
            <p className="text-sm leading-relaxed">
              ユーザー情報の保護のため、適切なセキュリティ対策を講じています。
              ただし、インターネット上の通信は完全に安全ではないことをご理解ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. お問い合わせ</h2>
            <p className="text-sm leading-relaxed">
              プライバシーに関するお問い合わせは、アプリ内のお問い合わせ機能よりご連絡ください。
            </p>
          </section>

          <p className="text-xs text-[#8b7355] mt-6">
            最終更新日: 2024年2月
          </p>
        </div>
      </div>
    </div>
  )
}
