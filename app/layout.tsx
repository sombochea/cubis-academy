import type { Metadata } from 'next';
import { Manrope, Kantumruy_Pro } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${kantumruyPro.variable} font-sans font-kantumruy antialiased`}>
        {children}
      </body>
    </html>
  );
}
