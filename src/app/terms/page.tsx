'use client'

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="ac-card bg-[#fffacd]/95 p-6">
        <h1 className="text-2xl font-bold text-[#5d4e37] mb-6">利用規約</h1>

        <div className="space-y-4 text-[#5d4e37]">
          <section>
            <h2 className="text-lg font-bold mb-2">第1条（適用）</h2>
            <p className="text-sm leading-relaxed">
              本規約は、推しポチ（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">第2条（利用資格）</h2>
            <p className="text-sm leading-relaxed">
              本サービスは18歳以上の方のみご利用いただけます。
              18歳未満の方の利用は固くお断りいたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">第3条（禁止事項）</h2>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーになりすます行為</li>
              <li>著作権等の知的財産権を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>その他、運営が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">第4条（免責事項）</h2>
            <p className="text-sm leading-relaxed">
              本サービスは現状有姿で提供されます。
              ユーザー間の取引・送金に関して、運営は一切の責任を負いません。
              送金は自己責任で行ってください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">第5条（投稿コンテンツ）</h2>
            <p className="text-sm leading-relaxed">
              投稿されたコンテンツは1時間後に自動削除されます。
              ユーザーは自身の投稿に関する責任を負うものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">第6条（規約の変更）</h2>
            <p className="text-sm leading-relaxed">
              運営は必要に応じて本規約を変更できるものとします。
              変更後の規約は本ページに掲載した時点で効力を生じます。
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
