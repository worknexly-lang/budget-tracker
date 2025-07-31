import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings, DollarSign } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <SidebarMenuButton href="/dashboard" isActive>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-4 p-4 border-b">
          <SidebarTrigger />
          <h2 className="text-xl font-semibold">Overview</h2>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
