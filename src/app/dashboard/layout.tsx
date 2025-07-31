
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings, DollarSign, BarChartHorizontal, Target } from "lucide-react";
import { ModeToggle } from '@/components/mode-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname === '/dashboard/analytics') return 'Analytics';
    if (pathname === '/dashboard/savings') return 'Savings Goal';
    return 'Dashboard';
  }

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
                <Link href="/dashboard" passHref legacyBehavior>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                        <a>
                            <Home />
                            Dashboard
                        </a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/analytics" passHref legacyBehavior>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/analytics'}>
                        <a>
                            <BarChartHorizontal />
                            Analytics
                        </a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/savings" passHref legacyBehavior>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/savings'}>
                        <a>
                            <Target />
                            Savings
                        </a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="#" passHref legacyBehavior>
                    <SidebarMenuButton asChild>
                        <a>
                            <Settings />
                            Settings
                        </a>
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
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
