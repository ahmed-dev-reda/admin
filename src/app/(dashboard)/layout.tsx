import { AppSidebar } from "@/components/layout/app-sidebar";
import Navbar from "@/components/layout/navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="flex-1 px-4">
        <Navbar />
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
