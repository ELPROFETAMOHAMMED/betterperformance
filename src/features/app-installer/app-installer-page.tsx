"use client";

import { useState } from "react";
import { SearchPackagesInput } from "./search-packages/search-packages-input";
import { SearchPackagesResults } from "./search-packages/search-packages-results";
import { SelectedPackagesList } from "./selected-packages/selected-packages-list";
import { useSearchPackages } from "./search-packages/use-search-packages";
import { generateInstallerScript } from "./generate-installer-script/generate-installer-script";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Copy, Check, Sparkles, Terminal, ShoppingCart, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { WingetPackage } from "./types/winget-package";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { useSelection } from "@/features/tweaks/context/selection-context";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

/**
 * Main feature orchestrator for the App Installer generator.
 * Manages search state, selection state, and script generation UI.
 */
export default function AppInstallerPage() {
  const [query, setQuery] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<WingetPackage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  const { packages, isLoading, error } = useSearchPackages(query);
  const { toggleTweak } = useSelection();

  const handleTogglePackage = (id: string) => {
    setSelectedPackages((prev) => {
      const isSelected = prev.some((p) => p.Id === id);
      if (isSelected) {
        return prev.filter((p) => p.Id !== id);
      } else {
        const pkg = packages.find((p) => p.Id === id);
        return pkg ? [...prev, pkg] : prev;
      }
    });
  };

  const handleRemovePackage = (id: string) => {
    setSelectedPackages((prev) => prev.filter((p) => p.Id !== id));
  };

  const handleClear = () => {
    setSelectedPackages([]);
    toast.success("All selections cleared");
  };

  const handleGenerate = () => {
    if (selectedPackages.length === 0) {
      toast.error("Please select at least one application");
      return;
    }
    const ids = selectedPackages.map((p) => p.Id);
    const script = generateInstallerScript(ids);
    setGeneratedScript(script);
    setIsDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    setHasCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const downloadScript = () => {
    const scriptContent = `function Invoke-BatchAppInstaller {
    [CmdletBinding()]
    param ()

    try {
        Write-Host "Starting batch application installation..." -ForegroundColor Cyan
        
${generatedScript.split('\\n').map(line => '        ' + line).join('\\n')}

        Write-Host "Application installation completed successfully." -ForegroundColor Green
    } catch {
        Write-Host "An error occurred during installation: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

Invoke-BatchAppInstaller
`;

    const blob = new Blob([scriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install-apps.ps1";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Batch file downloaded successfully");
  };

  const addToGlobalState = () => {
    if (selectedPackages.length === 0) return;
    
    const customTweak: Tweak = {
      id: `winget-batch-${Date.now()}`,
      title: `App Installer Batch (${selectedPackages.length})`,
      description: `Silent install for: ${selectedPackages.map(p => p.Latest.Name).join(", ")}`,
      code: `\n# App Installer Batch\n${generatedScript}\n`,
      download_count: 0,
      favorite_count: 0,
      is_visible: true,
    };
    
    toggleTweak(customTweak);
    toast.success("Added to global queue successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-12 md:py-16">
      <div className="flex flex-col gap-12">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Windows Optimization</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4">
              Batch <span className="text-primary italic">App</span> Installer
            </h1>
            <p className="text-xl text-muted-foreground/80 max-w-2xl leading-relaxed font-medium">
              Find and select official Windows applications to generate a silent installation script.
              Say goodbye to manual downloads — use the power of <span className="text-foreground animate-pulse underline decoration-primary/40 underline-offset-4">winget</span>.
            </p>
          </div>
        </motion.header>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Search & Results (8 columns) */}
          <div className="lg:col-span-8 space-y-10">
            <div className="relative">
              <SearchPackagesInput value={query} onChange={setQuery} />
              
              {/* API Status Badge */}
              <div className="absolute -bottom-6 right-2 flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : error ? "bg-red-500" : "bg-emerald-500")} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {isLoading ? "Searching API..." : error ? "API Error" : "Winget API Connected"}
                </span>
              </div>
            </div>

            <div className="min-h-[400px]">
              <SearchPackagesResults
                packages={packages}
                isLoading={isLoading}
                selectedIds={selectedPackages.map((p) => p.Id)}
                onToggle={handleTogglePackage}
                query={query}
              />
            </div>
          </div>

          {/* Right: Selected List (4 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <SelectedPackagesList
              selectedPackages={selectedPackages}
              onRemove={handleRemovePackage}
              onClear={handleClear}
              onGenerate={handleGenerate}
            />
          </motion.div>
        </div>
      </div>

      {/* Script Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-5xl overflow-hidden border-border/40 bg-card/95 backdrop-blur-2xl p-0 rounded-3xl shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          
          <DialogHeader className="p-8 pb-4">
             <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Terminal className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">Script Preview</DialogTitle>
                  <p className="text-sm text-muted-foreground">The following PowerShell script will be generated.</p>
                </div>
             </div>
          </DialogHeader>

          <div className="px-8 pb-6">
            <div className="relative group rounded-2xl overflow-hidden border border-border/20 shadow-inner">
              <div className="absolute top-0 left-0 w-full h-8 bg-muted/40 border-b border-border/10 flex items-center px-4 gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                <span className="ml-2 text-[10px] font-mono text-muted-foreground/60">install-apps.ps1 — PowerShell</span>
              </div>
              <pre className="bg-secondary/40 pt-12 pb-8 px-8 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all text-foreground/80 leading-relaxed custom-scrollbar max-h-[400px]">
                {generatedScript}
              </pre>
              <div className="absolute bottom-4 right-4">
                 <Button 
                   size="sm" 
                   variant="secondary" 
                   className={cn(
                     "h-10 px-4 rounded-xl shadow-lg border border-border/20 transition-all duration-300",
                     hasCopied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "hover:bg-primary/10 hover:text-primary"
                   )} 
                   onClick={copyToClipboard}
                 >
                  {hasCopied ? <Check className="h-4 w-4 mr-2" strokeWidth={3} /> : <Copy className="h-4 w-4 mr-2" />}
                  <span className="font-bold">{hasCopied ? "Copied!" : "Copy Code"}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-8 pt-0 flex gap-4">
            <Button 
              className="flex-1 h-14 text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" 
              onClick={addToGlobalState}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Global Tweak Queue
            </Button>
            <Button 
              variant="secondary"
              className="flex-1 h-14 text-base font-bold rounded-2xl transition-all duration-300 border border-border/20 shadow-sm" 
              onClick={downloadScript}
            >
              <Download className="h-5 w-5 mr-2" />
              Download as .ps1
            </Button>
            <Button 
              variant="ghost" 
              className="h-14 px-6 text-base font-bold rounded-2xl bg-transparent border-border/40 hover:bg-muted" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decorative Floor Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-primary/5 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
