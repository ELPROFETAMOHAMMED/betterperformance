import MainHeader from "@/components/layout/main-header";
import QueryProvider from "@/app/providers/query-client-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <div
          className={"flex flex-col w-full h-screen"}
          suppressHydrationWarning={true}
        >
          <MainHeader />
          {children}
        </div>
      </TooltipProvider>
    </QueryProvider>
  );
}
