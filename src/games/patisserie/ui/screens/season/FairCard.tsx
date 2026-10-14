import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import {
  canStageFair,
  difficultyById,
  fairDayOf,
  fairTentByNumber,
  fairThemeById,
  productById,
  ribbonById,
  showpieceIssue,
  type GameState,
} from "../../../core";
import type { PlayView } from "../../patisserieRoute";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook } from "../../art/bakeLook";
import { Rosette } from "../../art/Rosette";
import { ThemeCard } from "./ThemeCard";

export interface FairCardProps {
  readonly state: GameState;
  readonly onStartShowpiece: (event: ClickLike) => void;
  readonly onMoveUp: (event: ClickLike) => void;
  readonly onOpen: (view: PlayView) => void;
}

export function FairCard({ state, onStartShowpiece, onMoveUp, onOpen }: FairCardProps) {
  const fair = state.fair;
  if (fair === null || fair.themeId === null) return null;
  const theme = fairThemeById(fair.themeId);
  const tent = fairTentByNumber(fair.tent);
  const ready = tent.readyMark + difficultyById(state.profile.difficulty).minQualityBonus;
  const run = state.activeRun;
  const building = run !== null && run.stage !== "done" && run.purpose.kind === "showpiece";
  const start = showpieceIssue(state);
  const stage = canStageFair(state);
  const entryLook = fair.entry === null ? null : bakeLook(fair.entry.design, fair.entry.toppings, true);
  const result = fair.result;
  return (
    <div className="pa-fair-card" data-testid="fair-card">
      <div className="pa-fair-card__theme">
        <ThemeCard theme={theme} compact />
      </div>
      <div className="pa-fair-card__tent">
        <span className="ad-eyebrow">Tent {tent.tent} of 5</span>
        <h4>{tent.name}</h4>
        <ul className="pa-fair-card__facts">
          <li>
            <Icon name="star" size={14} /> Showpiece:{" "}
            {tent.products.map((id) => productById(id).name).join(", ")}
          </li>
          <li>
            <Icon name="heart" size={14} /> Ready for the Fair at quality {ready}. Ready or not, the Fair is
            glad to see you.
          </li>
          <li>
            <Icon name="bag" size={14} /> Budget {tent.budget} coins · {tent.themeToppings} theme toppings
          </li>
          <li>
            <Icon name="calendar" size={14} /> Fair Day is day {fairDayOf(fair)}
          </li>
        </ul>
      </div>
      <div className="pa-fair-card__status">
        {result !== null ? (
          <div className="pa-fair-card__result">
            <Rosette ribbon={result.ribbon} size={72} title={ribbonById(result.ribbon).name} />
            <div>
              <strong>{ribbonById(result.ribbon).name}</strong>
              <span className="pa-muted">Overall {result.overall}</span>
              <Button size="sm" variant="secondary" onClick={() => onOpen("fair")}>
                See the Fair notes
              </Button>
              {fair.tentOffer ? (
                <Button size="sm" icon="sparkle" onClick={onMoveUp} data-testid="move-up-tent">
                  Move up a tent?
                </Button>
              ) : null}
            </div>
          </div>
        ) : entryLook !== null ? (
          <div className="pa-fair-card__entry">
            <BakePreview
              look={entryLook}
              title="Your showpiece"
              className="pa-fair-card__art"
              plaque={fair.entry?.word ?? null}
            />
            <div>
              <TagPill tone="sage">Waiting under a cloth</TagPill>
              {stage.ok ? (
                <Button size="lg" icon="star" onClick={() => onOpen("fair")} data-testid="go-to-fair">
                  Go to the Fair
                </Button>
              ) : (
                <span className="pa-muted">{stage.reasons[0]}</span>
              )}
            </div>
          </div>
        ) : building ? (
          <Button icon="sparkle" onClick={() => onOpen("bake")}>
            Back to the showpiece
          </Button>
        ) : (
          <Button
            icon="star"
            onClick={onStartShowpiece}
            disabledReason={start ?? undefined}
            showReason
            data-testid="start-showpiece"
          >
            Start your showpiece
          </Button>
        )}
      </div>
    </div>
  );
}
