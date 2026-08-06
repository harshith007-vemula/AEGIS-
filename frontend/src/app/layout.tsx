import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import FloatingVoiceAssistant from '@/components/FloatingVoiceAssistant';

export const metadata: Metadata = {
  title: 'AEGIS AI - Autonomous Emergency & Intelligent Governance System',
  description: 'Autonomous disaster coordination, risk prediction, and emergency governance monorepo operating system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Outfit Google Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 cyber-grid">
        <div className="flex min-h-screen">
          {/* Global Sidebar Navigation */}
          <Navigation />
          
          {/* Main App Container */}
          <main className="flex-1 w-full min-h-screen relative">
            {children}
            <FloatingVoiceAssistant />
          </main>
        </div>
      </body>
    </html>
  );
}
