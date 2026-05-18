'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Phase-1 minimal nav. Phase 5 replaces this with the AT-style top-left logo
 * and a right-side sliding hamburger menu.
 */
export function Nav() {
  const pathname = usePathname();
  return (
    <header className="nav-layer">
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm tracking-[0.3em] uppercase text-[var(--accent-magenta)] font-medium"
          aria-label="Home"
        >
          学习项目
        </Link>
      </div>
      <nav className="absolute top-6 right-6 flex gap-6 text-xs uppercase tracking-[0.25em]">
        {routes.map((r) => {
          const active =
            r.href === '/'
              ? pathname === '/'
              : pathname.startsWith(r.href);
          return (
            <Link
              key={r.href}
              href={r.href}
              data-active={active}
              className={
                active
                  ? 'text-[var(--accent-magenta)]'
                  : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors'
              }
            >
              {r.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
