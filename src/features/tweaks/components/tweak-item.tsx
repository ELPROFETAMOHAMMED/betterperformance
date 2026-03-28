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
  isAdmin?: boolean;
}

export function TweakItem({
  tweak,
  selected,
  onToggle,
  showCategory = false,
  categoryName,
  showCategoryAsDescription = false,
  showReportDescription = false,
  isAdmin = false,
}: TweakItemProps) {
  const isDisabled = !tweak.is_visible && !isAdmin;

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.stopPropagation();
    onToggle();
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-3 py-2 mx-2 my-0.5 rounded-md transition-all duration-150",
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer",
        selected && !isDisabled 
          ? "bg-secondary hover:bg-secondary/80" 
          : !isDisabled && "hover:bg-secondary/40"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "mt-0.5 h-4 w-4 shrink-0 rounded-[3px] border flex items-center justify-center transition-colors bg-background",
        isDisabled
          ? "border-muted-foreground/20 bg-muted/20"
          : selected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/40 group-hover:border-muted-foreground/60"
      )}>
        {selected && !isDisabled && <CheckCircleIcon className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className={cn(
              "text-sm font-medium leading-none mb-1 transition-colors",
              isDisabled
                ? "text-muted-foreground"
                : selected
                  ? "text-primary"
                  : "text-foreground"
            )}>
              {tweak.title}
            </p>
            {isDisabled && (
              <span className="text-[10px] text-muted-foreground/70 font-normal">
                (Disabled)
              </span>
            )}
          </div>
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

