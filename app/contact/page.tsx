import { ContactForm } from './ContactForm';

export default function ContactPage() {
  return (
    <section className="min-h-[100dvh] px-8 pt-32 pb-24 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-magenta)] mb-4">
        Contact
      </p>
      <h1 className="text-4xl sm:text-6xl font-medium leading-[0.95] tracking-tight">
        Say hello.
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
        说点什么都好。学习项目 LAB 不是真实工作室，本表单仅作为演示 —
        提交不会真的发送到任何地方。
        <br />
        <span className="text-white/40">
          This is a study deck — the form is a UI demo, nothing is sent.
        </span>
      </p>
      <ContactForm />
    </section>
  );
}
