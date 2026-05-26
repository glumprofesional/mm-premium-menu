import type { Metadata, Viewport } from 'next';
import TopLoadingBar from '@/components/TopLoadingBar';
import './globals.css';

/* ---- Metadata ---- */
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'M&M Admin',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#da5a47',
};

/* ---- Anti-flash dark theme script ---- */
const antiFlashScript = `
  (function(){
    try {
      var s = localStorage.getItem('theme');
      if (s === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch(e){}
  })();
`;

/* ---- Service Worker Registration ---- */
const swRegisterScript = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </head>
      <body className="antialiased">
        <TopLoadingBar />
        <main>{children}</main>
      </body>
    </html>
  );
}