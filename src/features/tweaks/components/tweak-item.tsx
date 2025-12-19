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
        "group flex items-start gap-3 p-2 rounded-md transition-all duration-200",
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer",
        selected && !isDisabled ? "bg-primary/5" : !isDisabled && "hover:bg-muted/40"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors",
        isDisabled
          ? "border-muted-foreground/20 bg-muted/30"
          : selected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/40 group-hover:border-primary/50"
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

