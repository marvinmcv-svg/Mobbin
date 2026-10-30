import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/Toaster";
import { LIBRARY_NAME } from "@/lib/config";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"] });
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${LIBRARY_NAME} — a field guide to shipped interfaces`,
    template: `%s · ${LIBRARY_NAME}`,
  },
  description:
    "A searchable library of real website sections, app screens and flows, captured and tagged by hand.",
  robots: { index: false, follow: false }, // invite-only until we decide otherwise
};

// Applies the stored theme before paint to avoid a flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-paper-raised focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <footer className="mx-auto mt-24 flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-t border-rule px-4 py-8 font-mono text-xs text-ink-faint sm:px-8">
          <span>{LIBRARY_NAME} · every capture lists its source app, version and date.</span>
          <span>Spotted your product and want it removed? Use “Report” on any item.</span>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
