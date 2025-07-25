import type { Metadata } from "next";
import "./globals.css";
import { ClientAuthProvider } from '@/components/providers/client-auth-provider';

export const metadata: Metadata = {
  title: "火星日记模拟器",
  description: "将你的日常生活转换为火星殖民者的奇妙经历",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}