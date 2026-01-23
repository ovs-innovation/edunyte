import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-64 border-border bg-muted/50 pl-9 placeholder:text-muted-foreground focus:bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <UserMenu />
          </div>
        </header>

        {/* Main Content - Only this area scrolls */}
        <main className="flex-1 overflow-y-auto">
          <div className="gradient-glow pointer-events-none absolute inset-x-0 top-16 h-32 opacity-50" />
          <div className="relative p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
