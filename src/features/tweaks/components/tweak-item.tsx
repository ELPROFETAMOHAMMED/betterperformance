import { Badge } from "@/shared/components/ui/badge";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { cn } from "@/shared/lib/utils";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

interface TweakItemProps {
  tweak: Tweak;
  selected: boolean;
  onToggle: () => void;
  showCategory?: boolean;
  categoryName?: string;
  showCategoryAsDescription?: boolean;
  showReportDescription?: boolean;
}

export function TweakItem({
  tweak,
  selected,
  onToggle,
  showCategory = false,
  categoryName,
  showCategoryAsDescription = false,
  showReportDescription = false,
}: TweakItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-2 rounded-md cursor-pointer transition-all duration-200",
        selected ? "bg-primary/5" : "hover:bg-muted/40"
      )}
      onClick={onToggle}
    >
      <div className={cn(
        "mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors",
        selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 group-hover:border-primary/50"
      )}>
        {selected && <CheckCircleIcon className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "text-sm font-medium leading-none mb-1 transition-colors",
            selected ? "text-primary" : "text-foreground"
          )}>
            {tweak.title}
          </p>
          {showCategory && categoryName && !showCategoryAsDescription && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal text-muted-foreground">
              {categoryName}
            </Badge>
          )}
        </div>
        {showCategoryAsDescription && categoryName ? (
           <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed flex items-center gap-1">
             <span className="opacity-70">Category:</span> {categoryName}
           </p>
        ) : showReportDescription && tweak.report_description ? (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {tweak.report_description}
          </p>
        ) : tweak.description ? (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {tweak.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

