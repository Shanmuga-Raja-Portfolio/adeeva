import { StarRating } from "../../../../../ui/kit/StarRating";
import { easeOut, window01 } from "../../../../../ui/kit/easing";
import type { ShowWalker } from "./showCast";
import type { ShowSceneKind } from "../../../../../ui/show/showTimeline";

export interface ShowCaptionProps {
  kind: ShowSceneKind;
  t: number;
  walker: ShowWalker | null;
  walks: number;
  designer: string;
  themeName: string;
  still: boolean;
}

function presence(t: number, start: number, end: number, still: boolean): number {
  if (still) return 1;
  return easeOut(window01(t, start, start + 0.08)) * (1 - window01(t, end, end + 0.06));
}

export function ShowCaption({ kind, t, walker, walks, designer, themeName, still }: ShowCaptionProps) {
  if (kind === "walk" && walker !== null) {
    const shown = presence(t, 0.12, 0.84, still);
    return (
      <div
        className="ad-show-caption"
        style={{ opacity: shown, transform: `translateX(${((1 - shown) * -28).toFixed(1)}px)` }}
        data-testid="show-caption"
      >
        <span className="ad-show-caption__count">
          Look {walker.position + 1} of {walks} · {walker.role}
        </span>
        <span className="ad-show-caption__title">{walker.title}</span>
        <span className="ad-show-caption__detail">{walker.silhouette}</span>
        <StarRating stars={walker.look.evaluation.stars} size={14} />
      </div>
    );
  }
  if (kind === "finale") {
    const shown = presence(t, 0.08, 0.9, still);
    return (
      <div
        className="ad-show-caption ad-show-caption--centre"
        style={{ opacity: shown }}
        data-testid="show-caption"
      >
        <span className="ad-show-caption__count">The finale</span>
        <span className="ad-show-caption__title">{themeName}</span>
      </div>
    );
  }
  if (kind === "bow") {
    const shown = presence(t, 0.48, 1.2, still);
    return (
      <div
        className="ad-show-caption ad-show-caption--centre"
        style={{ opacity: shown }}
        data-testid="show-caption"
      >
        <span className="ad-show-caption__count">Your designer takes a bow</span>
        <span className="ad-show-caption__title">Bravo, {designer}!</span>
      </div>
    );
  }
  return null;
}
