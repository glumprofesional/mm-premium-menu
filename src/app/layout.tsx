import type { Metadata, Viewport } from 'next';
import TopLoadingBar from '@/components/TopLoadingBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'M&M Multiespacio — Carta Exclusiva',
  description: 'Catálogo premium de bebidas y experiencias. Escanea el QR y descubrí nuestra selección exclusiva en M&M Multiespacio, La Rioja.',
  keywords: ['M&M', 'Multiespacio', 'carta', 'bebidas', 'La Rioja', 'menú', 'premium', 'nocturno'],
  authors: [{ name: 'M&M Multiespacio' }],
  creator: 'M&M Multiespacio',
  openGraph: {
    title: 'M&M Multiespacio — Carta Exclusiva',
    description: 'Descubrí nuestra selección premium de bebidas y experiencias. La Rioja.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'M&M Multiespacio',
  },
  twitter: {
    card: 'summary',
    title: 'M&M Multiespacio — Carta Exclusiva',
    description: 'Descubrí nuestra selección premium de bebidas y experiencias. La Rioja.',
  },
  robots: {
    index: false,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#a31830',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://wyoqqsvjjlaivaqeblsr.supabase.co" />
        <link rel="dns-prefetch" href="https://wyoqqsvjjlaivaqeblsr.supabase.co" />
        <link rel="preload" href="/fonts/CabinetGrotesk.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/Manrope.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="antialiased">
        <TopLoadingBar />
        <main>{children}</main>
      </body>
    </html>
  );
}