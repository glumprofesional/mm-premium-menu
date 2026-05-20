import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "M&M Multiespacio | Menú Premium",
    template: "%s | M&M Multiespacio",
  },
  description: "Explora la selección exclusiva de bebidas y gastronomía de M&M Multiespacio. Una experiencia digital diseñada para la noche.",
  applicationName: "M&M Menu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "M&M Menu",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "M&M Multiespacio",
    title: "M&M Multiespacio | Menú Premium",
    description: "Experiencia QR Premium para el club más exclusivo.",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111", // Corregido: usa el color base dark correcto
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="es" 
      className="dark" // Corregido: Sin variables de next/font
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.remove('dark'); // Corregido: elimina dark
                document.documentElement.classList.add('light');
              }
            } catch(e) {}
          })()
        `}} />
      </head>
      {/* Corregido: se eliminaron las clases de selection hardcodeadas */}
      <body className="antialiased">
        <Header variant="home" />
        <main id="main-content" role="main" className="relative min-h-screen">
          {children}
        </main>
        <div id="portal-root" />
      </body>
    </html>
  );
}
