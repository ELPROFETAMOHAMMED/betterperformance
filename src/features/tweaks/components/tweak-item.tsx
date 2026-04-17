import { Badge } from "@/shared/components/ui/badge";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { cn } from "@/shared/lib/utils";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

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
  const { favoriteTweakIds, toggleFavorite } = useFavorites();
  const isDisabled = !tweak.is_visible && !isAdmin;
  const isFavorite = favoriteTweakIds.has(tweak.id);

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.stopPropagation();
    onToggle();
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const result = await toggleFavorite({
        itemType: "tweak",
        itemId: tweak.id,
      });

      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update favorite");
    }
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
        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border bg-background transition-colors",
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
              <span className="text-xs font-normal text-muted-foreground/70">
                (Disabled)
              </span>
            )}
          </div>
          {showCategory && categoryName && !showCategoryAsDescription && (
            <Badge variant="outline" className="h-4 px-1 text-xs font-normal text-muted-foreground">
              {categoryName}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleToggleFavorite}
            disabled={isDisabled}
          >
            {isFavorite ? <StarSolidIcon className="h-3.5 w-3.5 text-yellow-500" /> : <StarIcon className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {showCategoryAsDescription && categoryName ? (
           <p className="line-clamp-2 flex items-center gap-1 text-xs leading-relaxed text-muted-foreground">
             <span className="opacity-70">Category:</span> {categoryName}
           </p>
        ) : showReportDescription && tweak.report_description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {tweak.report_description}
          </p>
        ) : tweak.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {tweak.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

