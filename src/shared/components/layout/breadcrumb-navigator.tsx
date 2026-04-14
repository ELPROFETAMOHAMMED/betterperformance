"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

type BreadcrumbSegment = {
  href: string;
  label: string;
};

const BREADCRUMB_OVERRIDES: Record<string, BreadcrumbSegment[]> = {
  "/wallpapers": [
    { href: "/media", label: "Media" },
    { href: "/wallpapers", label: "Wallpapers" },
  ],
};

export function BreadcrumbNavigator() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbSegments =
    BREADCRUMB_OVERRIDES[pathname] ||
    segments
      .filter((segment) => segment !== "home")
      .map((segment, index) => ({
        href: `/${segments.slice(0, index + 1).join("/")}`,
        label: segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/home">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbSegments.map((segment, index) => {
          const isLast = index === breadcrumbSegments.length - 1;

          return (
            <React.Fragment key={segment.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
