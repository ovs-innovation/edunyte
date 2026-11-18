import { ReactNode, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-3 sm:px-6 backdrop-blur-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile hamburger menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative flex-1 max-w-[150px] sm:max-w-xs md:max-w-sm">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full border-border bg-muted/50 pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm placeholder:text-muted-foreground focus:bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <RoleSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <UserMenu />
          </div>
        </header>

        {/* Main Content - Only this area scrolls */}
        <main className="flex-1 overflow-y-auto">
          <div className="gradient-glow pointer-events-none absolute inset-x-0 top-16 h-32 opacity-50" />
          <div className="relative p-3.5 sm:p-6 max-w-full overflow-x-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
