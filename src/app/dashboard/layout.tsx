
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings, DollarSign, BarChartHorizontal, Target, FileText, LogOut } from "lucide-react";
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="text-2xl font-bold">Loading...</div>
        </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname === '/dashboard/analytics') return 'Analytics';
    if (pathname === '/dashboard/savings') return 'Savings Goal';
    if (pathname === '/dashboard/emi') return 'EMI Analyzer';
    return 'Dashboard';
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-7 h-7" /> BudgetWise
            </h1>
          </div>
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
                <Link href="/dashboard">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                        <span>
                            <Home />
                            Dashboard
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/analytics">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/analytics'}>
                        <span>
                            <BarChartHorizontal />
                            Analytics
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/savings">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/savings'}>
                        <span>
                            <Target />
                            Savings
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/emi">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/emi'}>
                        <span>
                            <FileText />
                            EMI Analyzer
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
             <SidebarMenuItem>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut />
                    Logout
                </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="#">
                    <SidebarMenuButton asChild>
                        <span>
                            <Settings />
                            Settings
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-4 p-4 border-b">
          <SidebarTrigger />
          <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
            <ModeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
