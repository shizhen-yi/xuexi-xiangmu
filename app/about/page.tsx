export default function AboutPage() {
  return (
    <section className="min-h-[100dvh] px-8 pt-32 pb-16 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-green)] mb-4">
        About
      </p>
      <h1 className="text-4xl sm:text-6xl font-medium leading-[0.95] tracking-tight">
        Founded in 2026.
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-white/70 max-w-md">
        一个用 Three.js + React Three Fiber 复刻 activetheory.net 的学习项目。
        把他们闭源的 Hydra 引擎用开源栈等价拼出来。
      </p>
    </section>
  );
}
