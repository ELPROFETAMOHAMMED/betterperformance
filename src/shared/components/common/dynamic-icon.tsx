"use client";

import { cn } from "@/shared/lib/utils";
import { useState, useEffect, useRef } from "react";
import IconSkeleton from "./icon-skeleton";

type HeroIcon = React.ComponentType<React.ComponentProps<"svg">>;

interface DynamicIconProps {
  name?: string | null;
  className?: string;
  delayLoad?: boolean;
}

// Cache for individual icons - only load what we need
const iconCache = new Map<string, HeroIcon>();
const iconLoadPromises = new Map<string, Promise<HeroIcon>>();

// Convert icon name to PascalCase
const toPascalCase = (value?: string | null) => {
  if (!value) return "";
  return value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
};

const stripNumericSuffix = (value?: string | null) =>
  value?.replace(/[-_\s]*\d+$/g, "") ?? value ?? "";

// Load a single icon dynamically
const loadIcon = async (iconName: string): Promise<HeroIcon> => {
  // Check cache first
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  // Check if already loading
  if (iconLoadPromises.has(iconName)) {
    return iconLoadPromises.get(iconName)!;
  }

  const pascalName = toPascalCase(iconName);
  // Ensure "Icon" suffix
  const properName = pascalName.endsWith("Icon") ? pascalName : `${pascalName}Icon`;

  // Create promise to load icon
  const loadPromise = import("@heroicons/react/24/outline")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((module: any) => {
      // Try different name variations
      const candidates = [
        properName,
        pascalName, // In case it already had Icon or didn't need it (unlikely for Heroicons)
        toPascalCase(stripNumericSuffix(iconName)) + "Icon",
      ].filter(Boolean);

      for (const candidate of candidates) {
        if (candidate && module[candidate]) {
          const Icon = module[candidate] as HeroIcon;
          if (Icon) {
            iconCache.set(iconName, Icon);
            return Icon;
          }
        }
      }

      // Fallback to Square equivalent (StopIcon)
      const Fallback = module.StopIcon as HeroIcon;
      if (Fallback) {
        iconCache.set(iconName, Fallback);
        return Fallback;
      }

      throw new Error(`Icon not found: ${iconName}`);
    })
    .catch((error) => {
      console.error(`Failed to load icon ${iconName}:`, error);
      // Return a default icon from a new import to ensure we get something
      return import("@heroicons/react/24/outline").then((m) => m.StopIcon as HeroIcon);
    });

  iconLoadPromises.set(iconName, loadPromise);
  
  loadPromise.finally(() => {
    iconLoadPromises.delete(iconName);
  });

  return loadPromise;
};

export default function DynamicIcon({ name, className, delayLoad = false }: DynamicIconProps) {
  const [IconComponent, setIconComponent] = useState<HeroIcon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(!delayLoad);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer to only load when visible (if delayLoad is true)
  useEffect(() => {
    if (!delayLoad) {
      setShouldLoad(true);
      return;
    }

    if (shouldLoad) return;

    // Check if element is already visible (no need for observer)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100;
      if (isVisible) {
        setShouldLoad(true);
        return;
      }
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: load after a short delay
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      { 
        rootMargin: "100px", // Start loading before it's fully visible
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [delayLoad, shouldLoad]);

  // Load icon when ready
  useEffect(() => {
    if (!name) {
      setIsLoading(false);
      return;
    }

    if (!shouldLoad) {
      return;
    }

    setIsLoading(true);
    loadIcon(name)
      .then((Icon) => {
        setIconComponent(() => Icon);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load icon:", error);
        setIsLoading(false);
      });
  }, [name, shouldLoad]);

  // Always render container with ref for intersection observer
  return (
    <div ref={containerRef} className="inline-flex items-center">
      {isLoading || !IconComponent ? (
        <IconSkeleton className={cn("h-4 w-4", className)} />
      ) : (
        <IconComponent className={cn("h-4 w-4", className)} />
      )}
    </div>
  );
}



