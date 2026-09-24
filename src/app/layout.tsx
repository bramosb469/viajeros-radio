import type { Metadata } from 'next';
import { DM_Serif_Display, Inter, Caveat, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { prisma } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RadioPlayerWrapper from '@/components/player/RadioPlayerWrapper';
import { PlayerProvider } from '@/lib/player-context';
import { ThemeProvider } from '@/lib/theme-provider';

type MenuItem = {
  slug: string;
  label: string;
  icon?: string | null;
  visible: boolean;
};

type SocialNetwork = {
  platform: string;
  url: string;
  label: string;
  visible: boolean;
};

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const caveat = Caveat({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Viajeros Radio - Transmisión en vivo',
  description: 'Emisora de radio uruguaya con identidad folclórica y rural.',
  openGraph: {
    title: 'Viajeros Radio',
    description: 'Emisora de radio uruguaya con identidad folclórica y rural.',
    siteName: 'Viajeros Radio',
    locale: 'es_UY',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteSettings = null;
  let menuItems: MenuItem[] = [];
  let socialNetworks: SocialNetwork[] = [];

  try {
    siteSettings = await prisma.siteSettings.findFirst();
    menuItems = await prisma.menuItem.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    });
    socialNetworks = await prisma.socialNetwork.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching layout data:', error);
  }

  const streamUrl = siteSettings?.streamUrl || '';

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${dmSerifDisplay.variable} ${inter.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <PlayerProvider>
            <Header
              menuItems={menuItems}
              socialNetworks={socialNetworks}
              siteName={siteSettings?.siteName ?? 'Viajeros Radio'}
              slogan={siteSettings?.slogan ?? ''}
              logoUrl={siteSettings?.logoUrl ?? '/logo.jpg'}
            />
            <main className="main-content">
              {children}
            </main>
            <Footer
              socialNetworks={socialNetworks}
              siteName={siteSettings?.siteName ?? 'Viajeros Radio'}
              slogan={siteSettings?.slogan ?? ''}
              footerText={siteSettings?.footerText ?? '© Viajeros Radio. Todos los derechos reservados.'}
              menuItems={menuItems}
            />
            <RadioPlayerWrapper streamUrl={streamUrl || ''} currentProgram={null} />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
