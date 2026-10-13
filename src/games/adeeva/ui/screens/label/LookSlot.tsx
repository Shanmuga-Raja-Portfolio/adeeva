import type { CSSProperties } from "react";
import type { ShowThemeDef } from "../../../content/showTheme";
import { lookStartIssue, type GameState, type LabelSeason } from "../../../core";
import { skinHex } from "../../../../../ui/art/avatar/Avatar";
import { designFabrics, designParts } from "../../art/designLook";
import { DressPreview } from "../../art/DressPreview";
import { Button } from "../../../../../ui/kit/Button";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { lookDress } from "./lookDress";
import { lookSilhouette, lookTitle } from "./lookTitle";
import { modelLook } from "./modelLook";
import { PaletteChips } from "./PaletteChips";
import { runStageName } from "./runStageName";

export interface LookSlotProps {
  state: GameState;
  season: LabelSeason;
  theme: ShowThemeDef;
  index: number;
  onDesign: (index: number) => void;
  onContinue: () => void;
  onSetAside: () => void;
}

const tilts = [-1.6, 1.1, -0.7];

export function LookSlot({ state, season, theme, index, onDesign, onContinue, onSetAside }: LookSlotProps) {
  const look = season.looks[index] ?? null;
  const run = state.activeRun;
  const onTable =
    run !== null && run.stage !== "done" && run.purpose.kind === "look" && run.purpose.lookIndex === index;
  const style = { "--tilt": `${tilts[index] ?? 0}deg` } as CSSProperties;
  const number = index + 1;

  if (look !== null) {
    const dress = lookDress(look);
    const quality = look.evaluation.quality.quality;
    const qualityMet = look.evaluation.criteria.some(
      (criterion) => criterion.id === "quality" && criterion.passed,
    );
    return (
      <article className="ad-look-slot ad-look-slot--done" style={style} data-testid={`look-slot-${number}`}>
        <span className="ad-look-slot__tape" aria-hidden="true" />
        <div className="ad-look-slot__photo">
          <DressPreview
            parts={dress.parts}
            fabrics={dress.fabrics}
            trims={dress.trims}
            skinTone={skinHex(modelLook(look.runId, index))}
            title={`Look ${number}: ${lookTitle(look)}`}
          />
        </div>
        <div className="ad-look-slot__body">
          <span className="ad-look-slot__number">Look {number}</span>
          <h3 className="ad-look-slot__title">{lookTitle(look)}</h3>
          <p className="ad-look-slot__meta">{lookSilhouette(look)}</p>
          <div className="ad-look-slot__scores">
            <StarRating stars={look.evaluation.stars} size={14} />
            <span
              className={
                qualityMet ? "ad-look-slot__quality" : "ad-look-slot__quality ad-look-slot__quality--low"
              }
            >
              Quality {quality}
            </span>
          </div>
          <div className="ad-look-slot__tags">
            {look.snapshot.tags.map((tag) => (
              <TagPill key={tag} tone={theme.requiredTags.includes(tag) ? "gold" : "plain"}>
                {tag}
              </TagPill>
            ))}
          </div>
          <PaletteChips
            colours={look.snapshot.colours}
            highlight={theme.palette}
            size="sm"
            label={`Look ${number} colours`}
          />
        </div>
      </article>
    );
  }

  if (onTable) {
    return (
      <article className="ad-look-slot ad-look-slot--table" style={style} data-testid={`look-slot-${number}`}>
        <span className="ad-look-slot__tape" aria-hidden="true" />
        <div className="ad-look-slot__photo ad-look-slot__photo--sketch">
          <DressPreview
            parts={designParts(run.design)}
            fabrics={designFabrics(run.design)}
            title={`Look ${number} in progress`}
          />
        </div>
        <div className="ad-look-slot__body">
          <span className="ad-look-slot__number">Look {number}</span>
          <h3 className="ad-look-slot__title">On the cutting table</h3>
          <p className="ad-look-slot__meta">{runStageName(run.stage)}</p>
          <Button icon="needle" block onClick={onContinue}>
            Continue sewing
          </Button>
          <Button variant="ghost" size="sm" block onClick={onSetAside}>
            Set aside this look
          </Button>
        </div>
      </article>
    );
  }

  const issue = lookStartIssue(state, index);
  return (
    <article className="ad-look-slot ad-look-slot--empty" style={style} data-testid={`look-slot-${number}`}>
      <div className="ad-look-slot__photo ad-look-slot__photo--empty">
        <DressPreview parts={{}} fabrics={{}} title={`Empty croquis for look ${number}`} />
        <span className="ad-look-slot__plus" aria-hidden="true">
          +
        </span>
      </div>
      <div className="ad-look-slot__body">
        <span className="ad-look-slot__number">Look {number}</span>
        <h3 className="ad-look-slot__title">A blank page</h3>
        <p className="ad-look-slot__meta">
          Feels {theme.requiredTags.join(" and ")} · up to {theme.budget} coins
        </p>
        <Button
          icon="scissors"
          block
          disabledReason={issue ?? undefined}
          showReason
          onClick={() => onDesign(index)}
        >
          Design look {number}
        </Button>
        {issue !== null && run !== null && run.stage !== "done" ? (
          <Button variant="ghost" size="sm" block onClick={onSetAside}>
            Set aside the current dress
          </Button>
        ) : null}
      </div>
    </article>
  );
}
