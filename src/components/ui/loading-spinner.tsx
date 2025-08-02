'use client'

// 火星信标启动画面加载组件
export function MarsBeaconLoader({ text = 'Calibrating Martian relay' }: { text?: string }) {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen text-center overflow-hidden">
      {/* 纯黑背景 */}
      <div className="absolute inset-0 bg-black" />
      
      {/* 暗红径向渐变晕圈 */}
      <div className="absolute inset-0 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_120%,#2c0303_0%,transparent_70%)]" />
      
      {/* 星尘层 */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none" />

      {/* 深空信标加载环 */}
      <svg className="relative z-10 w-14 h-14 mb-6" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="38" stroke="#3a0e0e" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="240"
                className="mars-beacon-spin-slow" />
        <circle cx="50" cy="50" r="14" fill="#E85C35"
                className="mars-beacon-pulse-ring" />
      </svg>

      {/* 锐利白色文案配火星橙跳动点 */}
      <p className="relative z-10 font-mono tracking-widest text-sm text-[#E8E8E8] mb-8">
        {text}<span className="inline-block text-[#E85C35] mars-beacon-ellipsis">...</span>
      </p>

      {/* 扫描进度线 */}
      <div className="relative z-10 h-0.5 w-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BF4A2A] to-transparent mars-beacon-load" />
      </div>
    </section>
  )
}

// 全屏加载组件（保持向后兼容）
export function FullScreenLoading({ text = '正在连接火星基地...' }: { text?: string }) {
  return <MarsBeaconLoader text={text} />
}