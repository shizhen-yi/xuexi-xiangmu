import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-[400vh]">
      {/* Section 1 — hero (0-100vh) */}
      <section className="relative flex h-screen flex-col justify-end px-8 pb-16 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] mb-4">
          Creative Digital Experiences
        </p>
        <h1 className="text-5xl sm:text-7xl font-medium leading-[0.95] tracking-tight">
          We blend story, art &amp; technology.
        </h1>
        <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-white/40">
          Scroll Down ↓
        </p>
      </section>

      {/* Section 2 — Featured Work (100-200vh) */}
      <section className="relative h-screen flex items-center justify-end px-12">
        <div className="max-w-md text-right">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] mb-4">
            01 — Featured Work
          </p>
          <h2 className="text-4xl sm:text-5xl font-medium leading-[1.05] tracking-tight mb-6">
            Six projects in immersive web, XR, and AI.
          </h2>
          <Link
            href="/work"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white/80 hover:text-[var(--accent-magenta)] transition-colors border-b border-white/20 pb-1"
          >
            View All Work →
          </Link>
        </div>
      </section>

      {/* Section 3 — About (200-300vh) */}
      <section className="relative h-screen flex items-center px-12">
        <div className="max-w-md">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] mb-4">
            02 — Studio
          </p>
          <h2 className="text-4xl sm:text-5xl font-medium leading-[1.05] tracking-tight mb-6">
            A creative engineering studio.
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            学习项目 · Replica study of activetheory.net · Next.js 16 + React Three Fiber + Three.js · Phase 6 ring + particles + bilingual nav.
          </p>
        </div>
      </section>

      {/* Section 4 — Contact (300-400vh) */}
      <section className="relative h-screen flex items-center justify-center px-12">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] mb-6">
            03 — Let's talk
          </p>
          <h2 className="text-5xl sm:text-7xl font-medium leading-[0.95] tracking-tight mb-10">
            Have a project?
          </h2>
          <Link
            href="/contact"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white/80 hover:text-[var(--accent-magenta)] transition-colors border-b border-white/20 pb-1"
          >
            Get in Touch →
          </Link>
        </div>
      </section>
    </div>
  );
}
