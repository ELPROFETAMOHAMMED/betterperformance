import MainHeader from "@/components/layout/main-header";
import QueryProvider from "@/app/providers/query-client-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div
        className={"flex flex-col w-full h-screen"}
        suppressHydrationWarning={true}
      >
        <MainHeader />
        {children}
      </div>
    </QueryProvider>
  );
}
