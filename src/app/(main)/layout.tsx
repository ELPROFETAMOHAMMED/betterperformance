"use client";

import { MainHeader } from "@/shared/components/layout/main-header";
import { MainSidebar } from "@/shared/components/layout/main-sidebar";
import QueryProvider from "@/shared/providers/query-client-provider";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { SelectionProvider } from "@/features/tweaks/context/selection-context";
import { UserProvider } from "@/shared/providers/user-provider";

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SelectionProvider>
      <SidebarProvider>
        <MainSidebar />
        <SidebarInset className="h-screen flex flex-col overflow-hidden">
          <MainHeader />
          <div className="flex-1 min-h-0 container max-w-none p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SelectionProvider>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <UserProvider>
        <LayoutContent>{children}</LayoutContent>
      </UserProvider>
      <Toaster closeButton position="top-right"/>
    </QueryProvider>
  );
}



