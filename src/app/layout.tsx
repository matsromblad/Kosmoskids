
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import HyperspaceBackground from '@/components/fx/HyperspaceBackground';

export const metadata: Metadata = {
  title: 'Kosmoskids',
  description: 'Ett rymdäventyr för barn!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <HyperspaceBackground />
        <main className="flex-grow flex flex-col relative z-[1]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
