import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { getNextProject, getProjectBySlug } from '@/data/projects';

type Frontmatter = {
  title?: string;
  client?: string;
  year?: string;
  role?: string;
};

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Frontmatter = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]+?)"?$/);
    if (m) {
      const key = m[1] as keyof Frontmatter;
      meta[key] = m[2];
    }
  }
  return { meta, body: match[2].trim() };
}

/**
 * Render a small subset of markdown (`##` headings + lists + paragraphs).
 * Avoids pulling in a full markdown lib — content is hand-authored MDX
 * placeholders with predictable structure.
 */
function renderMarkdown(body: string): React.ReactNode[] {
  const blocks = body.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-12 mb-4 text-2xl font-medium tracking-tight">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').map((l) => l.replace(/^-\s+/, ''));
      return (
        <ul key={i} className="space-y-2 text-sm text-white/70 list-disc pl-5">
          {items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="text-sm leading-relaxed text-white/70 max-w-prose">
        {trimmed}
      </p>
    );
  });
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  let raw = '';
  try {
    raw = await readFile(
      path.join(process.cwd(), 'data', 'work-details', `${slug}.mdx`),
      'utf8',
    );
  } catch {
    raw = '';
  }
  const { meta, body } = parseFrontmatter(raw);

  const title = meta.title ?? project?.title ?? slug;
  const client = meta.client ?? project?.client ?? '';
  const year = meta.year ?? project?.year ?? '';
  const role = meta.role ?? '';
  const tags = project?.tags ?? [];
  const next = getNextProject(slug);

  return (
    <section className="min-h-[260vh] px-8 pt-32 pb-32 max-w-3xl pointer-events-none">
      <div className="pointer-events-auto space-y-6">
        <Link
          href="/work"
          className="text-xs uppercase tracking-[0.4em] text-white/40 hover:text-[var(--accent-magenta)] transition-colors"
        >
          ← Back to Work
        </Link>

        <h1 className="text-4xl sm:text-6xl font-medium leading-[0.95] tracking-tight">
          {title}
        </h1>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs uppercase tracking-[0.25em] text-white/40 max-w-md">
          {client && (
            <div>
              <dt className="text-white/30">Client</dt>
              <dd className="mt-1 text-white/70 normal-case tracking-normal">{client}</dd>
            </div>
          )}
          {year && (
            <div>
              <dt className="text-white/30">Year</dt>
              <dd className="mt-1 text-white/70 normal-case tracking-normal">{year}</dd>
            </div>
          )}
          {role && (
            <div className="col-span-2 sm:col-span-2">
              <dt className="text-white/30">Role</dt>
              <dd className="mt-1 text-white/70 normal-case tracking-normal text-[11px]">
                {role}
              </dd>
            </div>
          )}
        </dl>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
            {tags.map((tag) => (
              <li key={tag} className="border border-white/15 px-2 py-1 rounded-sm">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">{renderMarkdown(body)}</div>

        <div className="pt-16 border-t border-white/10">
          <p className="text-xs uppercase tracking-[0.4em] text-white/30 mb-2">
            Next case
          </p>
          <Link
            href={`/work/${next.slug}`}
            className="text-2xl font-medium hover:text-[var(--accent-magenta)] transition-colors"
          >
            {next.title} →
          </Link>
        </div>
      </div>
    </section>
  );
}
