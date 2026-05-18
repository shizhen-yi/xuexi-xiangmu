import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WebGLProvider } from '@/components/webgl/WebGLProvider';
import { LenisProvider } from '@/components/dom/LenisProvider';
import { Nav } from '@/components/dom/Nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '学习项目 — Active Theory Replica',
  description: '复刻 activetheory.net 的 WebGL 学习项目',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LenisProvider />
        <WebGLProvider />
        <Nav />
        <main className="dom-layer">{children}</main>
      </body>
    </html>
  );
}
