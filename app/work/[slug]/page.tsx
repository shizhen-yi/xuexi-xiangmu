import Link from 'next/link';

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <section className="min-h-[100dvh] px-8 pt-32 pb-16 max-w-3xl">
      <Link
        href="/work"
        className="text-xs uppercase tracking-[0.4em] text-white/40 hover:text-[var(--accent-magenta)] transition-colors"
      >
        ← Back to Work
      </Link>
      <h1 className="mt-4 text-4xl sm:text-6xl font-medium leading-[0.95] tracking-tight">
        {slug}
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-white/70 max-w-md">
        Phase-1 detail placeholder. Particle dissolve transition + ScrollControls
        narrative content lands in Phase 4.
      </p>
    </section>
  );
}
