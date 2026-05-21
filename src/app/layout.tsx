import type { Metadata, Viewport } from 'next';
import './globals.css';

/* ---- Metadata ---- */
export const metadata: Metadata = {
  title: 'M&M Multiespacio — Menú Premium',
  description: 'Catálogo premium de bebidas y experiencias. Escanea y descubre nuestra selección.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A1128',
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
      </head>
      <body className="antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}