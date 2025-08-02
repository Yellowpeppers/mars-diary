import type { Metadata } from "next";
import "./globals.css";
import { ClientAuthProvider } from '@/components/providers/client-auth-provider';

export const metadata: Metadata = {
  title: "MarsMe - Tell me your day & I'll unveil your beyond",
  description: "将你的日常生活转换为火星殖民者的奇妙经历",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Oxanium:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}