import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { TweakItem } from "../tweak-item";
import { TweaksEmptyState } from "../tweaks-empty-state";

interface FlatTreeProps {
  tweaks: Tweak[];
  categories: TweakCategory[];
  isAdmin: boolean;
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
  displayLimit: number;
  activeTab: string;
  historyShowCategory: boolean;
  popularShowCategory: boolean;
}

export function FlatTree({
  tweaks,
  categories,
  isAdmin,
  selectedTweaks,
  onTweakToggle,
  displayLimit,
  activeTab,
  historyShowCategory,
  popularShowCategory,
}: FlatTreeProps) {
  if (tweaks.length === 0) {
    return (
      <TweaksEmptyState
        title="No tweaks found"
        description="Try adjusting your filters"
      />
    );
  }

  return (
    <>
      {tweaks.slice(0, displayLimit).map((tweak) => (
        <TweakItem
          key={tweak.id}
          tweak={tweak}
          selected={selectedTweaks.has(tweak.id)}
          onToggle={() => onTweakToggle(tweak)}
          isAdmin={isAdmin}
          showCategory
          categoryName={categories.find((c) => c.id === tweak.category_id)?.name}
          showCategoryAsDescription={
            (activeTab === "history" && historyShowCategory) || (activeTab === "popular" && popularShowCategory)
          }
          showReportDescription={activeTab === "reported"}
        />
      ))}
      {tweaks.length > displayLimit && (
        <div className="py-4 text-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        </div>
      )}
    </>
  );
}
