import { TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

interface TabTriggerProps {
  value: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function VisualTreeTabTrigger({ value, icon, children }: TabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "relative h-8 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-2 pt-1.5 font-medium text-xs text-muted-foreground shadow-none transition-none",
        "data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
        "hover:text-foreground",
        // Focus styles adjustments: more subtle
        "focus-visible:ring-0 focus-visible:bg-muted/10" 
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        {children}
      </div>
    </TabsTrigger>
  );
}

