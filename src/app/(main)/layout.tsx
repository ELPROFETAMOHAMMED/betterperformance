"use client";

import MainHeader from "@/shared/components/layout/main-header";
import QueryProvider from "@/shared/providers/query-client-provider";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Toaster } from "@/shared/components/ui/sonner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={"flex flex-col w-full h-screen overflow-hidden"}
      suppressHydrationWarning={true}
    >
      <MainHeader />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <LayoutContent>{children}</LayoutContent>
        <Toaster closeButton position="top-right"/>
      </TooltipProvider>
    </QueryProvider>
  );
}



