import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WebGLProvider } from '@/components/webgl/WebGLProvider';
import { LenisProvider } from '@/components/dom/LenisProvider';
import { Nav } from '@/components/dom/Nav';
import { AudioToggle } from '@/components/dom/AudioToggle';
import { MobileFallback } from '@/components/dom/MobileFallback';
import { CustomCursor } from '@/components/dom/CustomCursor';
import { LoadingMandala } from '@/components/dom/LoadingMandala';

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
        <LoadingMandala />
        <CustomCursor />
        <MobileFallback />
        <LenisProvider />
        <WebGLProvider />
        <Nav />
        <AudioToggle />
        <main className="dom-layer">{children}</main>
      </body>
    </html>
  );
}
