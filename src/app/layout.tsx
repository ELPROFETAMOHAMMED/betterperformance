import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/shared/providers/theme-provider";
import { AnimatedBackground } from "@/shared/components/layout/animated-background";

export const metadata: Metadata = {
  title: "Betterperformance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <AnimatedBackground />
        </ThemeProvider>
      </body>
    </html>
  );
}



