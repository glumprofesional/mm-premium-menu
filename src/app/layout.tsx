import type { Metadata, Viewport } from "next";
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
  themeColor: "#111111",
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
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              }
            } catch(e) {}
          })()
        `}} />
      </head>
      <body className="antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}