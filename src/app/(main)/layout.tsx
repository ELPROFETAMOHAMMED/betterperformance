"use client";

import { MainHeader } from "@/shared/components/layout/main-header";
import { MainSidebar } from "@/shared/components/layout/main-sidebar";
import QueryProvider from "@/shared/providers/query-client-provider";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { SelectionProvider } from "@/features/tweaks/context/selection-context";
import { UserProvider } from "@/shared/providers/user-provider";
import { EditorSettingsProvider } from "@/features/settings/hooks/use-editor-settings";

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SelectionProvider>
      <SidebarProvider>
        <MainSidebar />
        <SidebarInset className="flex h-svh flex-col overflow-hidden">
          <MainHeader />
          <div className="relative flex-1 min-h-0 overflow-hidden">
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
        <EditorSettingsProvider>
          <LayoutContent>{children}</LayoutContent>
        </EditorSettingsProvider>
      </UserProvider>
      <Toaster closeButton position="top-right" />
    </QueryProvider>
  );
}
