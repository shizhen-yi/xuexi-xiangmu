'use client';

import { type FormEvent, useState } from 'react';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2400);
  };

  return (
    <form onSubmit={onSubmit} className="mt-12 flex flex-col gap-5 max-w-md">
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
        Name
        <input
          required
          type="text"
          name="name"
          autoComplete="name"
          className="border-0 border-b border-white/20 bg-transparent px-0 py-2 text-base font-normal tracking-normal text-white outline-none placeholder:text-white/30 focus:border-[var(--accent-magenta)]"
          placeholder="Your name"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
        Email
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="border-0 border-b border-white/20 bg-transparent px-0 py-2 text-base font-normal tracking-normal text-white outline-none placeholder:text-white/30 focus:border-[var(--accent-magenta)]"
          placeholder="you@example.com"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
        Message
        <textarea
          required
          name="message"
          rows={4}
          className="resize-none border border-white/20 bg-transparent p-3 text-base font-normal tracking-normal text-white outline-none placeholder:text-white/30 focus:border-[var(--accent-magenta)]"
          placeholder="Hello, learning project — …"
        />
      </label>
      <button
        type="submit"
        className="contact-submit group relative mt-2 self-start overflow-hidden border border-[var(--accent-magenta)] px-8 py-3 text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] transition-colors hover:text-black"
      >
        <span className="relative z-10">{sent ? 'Sent · 已发送（demo）' : 'Send · 发送'}</span>
        <span
          aria-hidden
          className="absolute inset-0 -z-0 origin-left scale-x-0 bg-[var(--accent-magenta)] transition-transform duration-300 ease-out group-hover:scale-x-100"
          style={{
            clipPath:
              'polygon(0 0, 96% 0, 100% 50%, 96% 100%, 0 100%, 4% 50%)',
          }}
        />
      </button>
    </form>
  );
}
