"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { X, Terminal, Trash2, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { WingetPackage } from "../types/winget-package";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";

interface SelectedPackagesListProps {
  selectedPackages: WingetPackage[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onGenerate: () => void;
}

/**
 * Side panel listing the selected applications.
 * Features Windows 11-inspired glassmorphism and animations.
 */
export function SelectedPackagesList({
  selectedPackages,
  onRemove,
  onClear,
  onGenerate,
}: SelectedPackagesListProps) {
  if (selectedPackages.length === 0) {
    return (
      <Card className="p-8 border-dashed border-2 border-border/40 bg-secondary/10 flex flex-col items-center justify-center text-center gap-4 opacity-60">
        <div className="h-16 w-16 rounded-3xl bg-secondary/50 flex items-center justify-center">
          <Box className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-lg">No apps selected</p>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Selected applications will appear here for batch installation.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24 p-6 border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl flex flex-col gap-6 ring-1 ring-border/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Queue</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {selectedPackages.length} {selectedPackages.length === 1 ? 'App' : 'Apps'} ready
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClear} 
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          title="Clear all"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-h-[calc(100vh-25rem)] overflow-y-auto pr-3 flex flex-col gap-3 custom-scrollbar">
        <AnimatePresence initial={false} mode="popLayout">
          {selectedPackages.map((pkg) => (
            <motion.div
              key={pkg.Id}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)", transition: { duration: 0.2 } }}
              className={cn(
                "group relative flex items-center justify-between p-3 rounded-2xl shrink-0 transition-all duration-200",
                "bg-secondary/40 border border-border/20 hover:border-primary/30 hover:bg-secondary/60"
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shrink-0 border border-border/10 shadow-sm">
                  {pkg.IconUrl ? (
                    <Image
                      src={pkg.IconUrl}
                      alt={pkg.Latest.Name}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain"
                      unoptimized
                    />
                  ) : (
                    <Box className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{pkg.Latest.Name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/70 truncate">{pkg.Id}</p>
                </div>
              </div>
              <button
                onClick={() => onRemove(pkg.Id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl"
              >
                <X className="h-4 w-4" strokeWidth={3} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <Button 
          className="group w-full h-14 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 rounded-2xl relative overflow-hidden" 
          onClick={onGenerate}
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <Terminal className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Generate Install Script
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium uppercase tracking-widest px-4 leading-relaxed">
          Generates a batch .ps1 script for silent installation
        </p>
      </div>
    </Card>
  );
}
