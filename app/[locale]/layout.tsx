import type { Metadata } from 'next';
import { Manrope, Kantumruy_Pro } from 'next/font/google';
import '../globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const kantumruyPro = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  variable: '--font-kantumruy',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CUBIS Academy - Learn Skills That Matter',
  description: 'Master technology skills with expert-led courses',
};

export async function generateStaticParams() {
  return [{ locale: 'km' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <html lang={locale}>
      <body className={`${manrope.variable} ${kantumruyPro.variable} ${locale === 'km' ? 'font-kantumruy' : 'font-sans'} antialiased`}>
        <LanguageProvider locale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
