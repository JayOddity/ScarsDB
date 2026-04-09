import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import AuthProvider from "@/components/AuthProvider";
import { getSiteSettings } from "@/lib/sanity";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.defaultSeo?.metaTitle || "ScarsHQ - Scars of Honor Database & Tools";
  const description = settings?.defaultSeo?.metaDescription || "Talent calculator, item database, class guides, and community tools for Scars of Honor MMORPG.";
  return {
    title,
    description,
    metadataBase: new URL('https://scarshq.com'),
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title,
      description,
      siteName: 'ScarsHQ',
      type: 'website',
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1920,
          height: 1080,
          alt: 'Scars of Honor',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-default.jpg'],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "ScarsHQ";
  const siteAbbrev = siteName.slice(0, 2).toUpperCase();
  const socials = settings?.socials;

  return (
    <html lang="en" className={`h-full antialiased ${cinzel.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ScarsHQ',
              url: 'https://scarshq.com',
              description: 'Talent calculator, item database, class guides, and community tools for Scars of Honor MMORPG.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://scarshq.com/items?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <AuthProvider>
          <Header siteName={siteName} siteAbbrev={siteAbbrev} />
          <main className="flex-1">{children}</main>
          <Footer siteName={siteName} siteAbbrev={siteAbbrev} socials={socials} />
        </AuthProvider>
      </body>
    </html>
  );
}
