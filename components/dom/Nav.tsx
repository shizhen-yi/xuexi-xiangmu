'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const routes = [
  { href: '/', label: 'Home', cn: '首页' },
  { href: '/work', label: 'Work', cn: '作品' },
  { href: '/about', label: 'About', cn: '关于' },
  { href: '/contact', label: 'Contact', cn: '联系' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Top-left wordmark + hamburger; full-screen slide-out menu with frosted blur.
 * The GSAP timeline is constructed once on mount, then play/reverse on toggle.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsWrapRef = useRef<HTMLUListElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!panelRef.current || !itemsWrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(panelRef.current, { xPercent: 100 });
      gsap.set('.menu-item', { x: 40, opacity: 0 });
      tlRef.current = gsap
        .timeline({ paused: true })
        .to(panelRef.current, { xPercent: 0, duration: 0.55, ease: 'power3.out' })
        .to(
          '.menu-item',
          { x: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: 'power2.out' },
          '-=0.25',
        );
    }, panelRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) tl.play();
    else tl.reverse();
  }, [open]);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="nav-layer">
      <div className="absolute left-6 top-6 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--accent-magenta)]"
          aria-label="Home"
        >
          学习项目
        </Link>
      </div>

      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group absolute right-6 top-6 flex h-10 w-10 flex-col items-center justify-center gap-[5px] text-white"
      >
        <span
          className={`block h-px w-6 bg-current transition-transform duration-300 ease-out ${
            open ? 'translate-y-[6px] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-px w-6 bg-current transition-opacity duration-200 ease-out ${
            open ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-px w-6 bg-current transition-transform duration-300 ease-out ${
            open ? '-translate-y-[6px] -rotate-45' : ''
          }`}
        />
      </button>

      <div
        ref={panelRef}
        aria-hidden={!open}
        className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col justify-between px-12 py-24 backdrop-blur-2xl"
        style={{ background: 'rgba(0, 0, 0, 0.72)', willChange: 'transform' }}
      >
        <nav>
          <ul ref={itemsWrapRef} className="flex flex-col gap-6">
            {routes.map((r) => {
              const active = isActive(pathname, r.href);
              return (
                <li key={r.href} className="menu-item">
                  <Link
                    href={r.href}
                    className={`group flex items-baseline gap-4 text-4xl font-medium tracking-tight transition-colors ${
                      active
                        ? 'text-[var(--accent-magenta)]'
                        : 'text-white hover:text-[var(--accent-magenta)]'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-sm uppercase tracking-[0.3em] text-white/40 group-hover:text-[var(--accent-magenta)]">
                      {r.cn}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="menu-item text-xs leading-relaxed text-white/40">
          <p>学习项目 / xuexi-xiangmu</p>
          <p className="mt-1">
            Replica study of activetheory.net · Next.js 16 + R3F
          </p>
        </div>
      </div>
    </header>
  );
}
