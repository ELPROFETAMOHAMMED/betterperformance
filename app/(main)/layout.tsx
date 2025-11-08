import MainHeader from "@/components/layout/main-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={"flex flex-col w-full h-screen"}
      suppressHydrationWarning={true}
    >
      <MainHeader />
      {children}
    </div>
  );
}
