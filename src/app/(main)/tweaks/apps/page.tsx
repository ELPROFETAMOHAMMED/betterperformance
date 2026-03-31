"use client";

import { motion } from "framer-motion";
import { CommandLineIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/shared/components/ui/badge";

export default function AppsPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2">
          <CommandLineIcon className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <Badge variant="secondary" className="mb-2">Developer Preview</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Software Center</h1>
          <p className="text-muted-foreground text-lg">
            Manage your Windows applications with ease. We are building an integrated 
            Software Center powered by <strong>winget</strong> and <strong>Chocolatey</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="p-6 rounded-xl border border-border/50 bg-secondary/10 text-left space-y-2 transition-all hover:border-primary/30">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <SparklesIcon className="h-4.5 w-4.5 text-primary" />
             </div>
             <h3 className="font-semibold">One-Click Install</h3>
             <p className="text-sm text-muted-foreground italic">Coming soon: Instant installation for popular apps without the hassle of setup files.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-secondary/10 text-left space-y-2 transition-all hover:border-primary/30">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <CommandLineIcon className="h-4.5 w-4.5 text-primary" />
             </div>
             <h3 className="font-semibold">Package Managers</h3>
             <p className="text-sm text-muted-foreground italic">Direct integration with Windows Package Manager (winget) for enterprise-grade deployments.</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60 mt-12">
          This feature is currently under heavy development. Stay tuned for updates!
        </p>
      </motion.div>
    </div>
  );
}
