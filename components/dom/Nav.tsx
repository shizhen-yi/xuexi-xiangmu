'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';

const items = [
  { href: '/work', label: 'WORK' },
  { href: '/contact', label: 'CONTACT' },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/work') return pathname === '/work' || pathname.startsWith('/work/');
  return pathname === href;
}

export function Nav() {
  const pathname = usePathname();
  const dashRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!dashRef.current) return;

    gsap.set(dashRef.current, {
      x: 0,
      width: 24,
      transformOrigin: '50% 50%',
    });
  }, []);

  const moveDash = (direction: 'left' | 'right') => {
    if (!dashRef.current) return;

    gsap.to(dashRef.current, {
      x: direction === 'left' ? -34 : 34,
      width: 14,
      duration: 0.32,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  const resetDash = () => {
    if (!dashRef.current) return;

    gsap.to(dashRef.current, {
      x: 0,
      width: 24,
      duration: 0.36,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  return (
    <header className="nav-layer">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto fixed right-6 top-6 z-[80] flex items-center gap-3 rounded-full bg-black/50 px-5 py-2.5 backdrop-blur-md"
        onMouseLeave={resetDash}
      >
        <Link
          href={items[0].href}
          onMouseEnter={() => moveDash('left')}
          onFocus={() => moveDash('left')}
          onBlur={resetDash}
          className={`text-[12px] font-medium uppercase leading-none tracking-[0.25em] transition-colors duration-200 ${
            isActive(pathname, items[0].href)
              ? 'text-[var(--accent-magenta)]'
              : 'text-white/80 hover:text-[var(--accent-magenta)]'
          }`}
        >
          {items[0].label}
        </Link>

        <span
          ref={dashRef}
          aria-hidden="true"
          className="block h-[2px] w-6 shrink-0 rounded-full bg-white"
        />

        <Link
          href={items[1].href}
          onMouseEnter={() => moveDash('right')}
          onFocus={() => moveDash('right')}
          onBlur={resetDash}
          className={`text-[12px] font-medium uppercase leading-none tracking-[0.25em] transition-colors duration-200 ${
            isActive(pathname, items[1].href)
              ? 'text-[var(--accent-magenta)]'
              : 'text-white/80 hover:text-[var(--accent-magenta)]'
          }`}
        >
          {items[1].label}
        </Link>
      </nav>
    </header>
  );
}
