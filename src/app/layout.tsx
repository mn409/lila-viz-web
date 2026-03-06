import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LILA BLACK — Player Journey Visualizer',
  description: 'Interactive heatmap and event visualizer for LILA APM data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
