import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-[var(--color-background)]">
        <Sidebar />
        <div className="md:pl-64 flex flex-col min-h-dvh">
          <Header />
          {/* Mobile pastda nav bor — pb berib qoldiramiz */}
          <main className="flex-1 pb-20 md:pb-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}