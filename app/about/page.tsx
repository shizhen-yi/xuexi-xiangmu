import Image from 'next/image';
import { teamMembers } from '@/data/about-team';

export default function AboutPage() {
  return (
    <section className="min-h-[100dvh] px-8 pt-32 pb-24 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] mb-4">
        About
      </p>
      <h1 className="text-4xl sm:text-6xl font-medium leading-[0.95] tracking-tight">
        学习项目 LAB
      </h1>

      <div className="mt-12 grid gap-12 md:grid-cols-2 max-w-3xl">
        <p className="text-sm leading-relaxed text-white/70">
          一个用 Next.js 16 + React Three Fiber 复刻 activetheory.net
          的学习项目。我们把 AT 闭源的 Hydra 引擎用开源栈等价拼出来，
          从走廊 hero 到玻璃方块网格、再到 30k 粒子转场，每一帧都希望对得起原作。
        </p>
        <p className="text-sm leading-relaxed text-white/70">
          We&apos;re a fictional studio built to study Active Theory&apos;s craft.
          Six imagined members, real shader notes, and a public log of every
          phase. The goal isn&apos;t a clone — it&apos;s to learn how the original
          stays this consistent across surfaces.
        </p>
      </div>

      <div className="mt-24">
        <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-8">
          Team — 团队
        </p>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {teamMembers.map((m) => (
            <li key={m.id} className="flex flex-col gap-3">
              <Image
                src={m.avatar}
                alt={m.name}
                width={120}
                height={120}
                unoptimized
                className="size-20 rounded-full object-cover ring-1 ring-white/10"
              />
              <div>
                <p className="text-sm font-medium tracking-tight">{m.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-magenta)] mt-0.5">
                  {m.role}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-white/60 max-w-[16rem]">
                {m.bio}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
