import { SessionProvider } from '@/components/SessionProvider';
import { SessionInitializer } from '@/components/SessionInitializer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionInitializer />
      {children}
    </SessionProvider>
  );
}
