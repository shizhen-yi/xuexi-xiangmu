import Link from 'next/link';

const placeholders = [
  { slug: 'prometheus', title: 'Prometheus Fuels', year: '2023' },
  { slug: 'cape', title: 'Cape of Good Hope', year: '2022' },
  { slug: 'lunar', title: 'Lunar Voice', year: '2021' },
  { slug: 'pottermore', title: 'Pottermore', year: '2020' },
];

export default function WorkPage() {
  return (
    <section className="min-h-[100dvh] px-8 pt-32 pb-16 max-w-5xl">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-cyan)] mb-4">
        Selected Work
      </p>
      <h1 className="text-4xl sm:text-6xl font-medium leading-[0.95] tracking-tight mb-12">
        Case studies.
      </h1>
      <ul className="grid sm:grid-cols-2 gap-6">
        {placeholders.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              className="block p-6 border border-white/10 hover:border-[var(--accent-magenta)] transition-colors"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                {p.year}
              </div>
              <div className="mt-2 text-xl">{p.title}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
