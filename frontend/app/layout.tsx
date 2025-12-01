import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Formador PWA",
  description: "Aplicación de formación progresiva",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Formador PWA",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Limpiar service workers antiguos primero
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (let registration of registrations) {
                    registration.unregister();
                  }
                  // Limpiar cachés
                  caches.keys().then((cacheNames) => {
                    cacheNames.forEach((cacheName) => {
                      caches.delete(cacheName);
                    });
                  });
                }).then(() => {
                  // Registrar nuevo service worker después de limpiar
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/service-worker.js')
                      .then((registration) => {
                        console.log('SW registered:', registration);
                      })
                      .catch((error) => {
                        console.log('SW registration failed:', error);
                      });
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

