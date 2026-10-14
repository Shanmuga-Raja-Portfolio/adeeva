import { useToast } from "../../../../../studio/ToastContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { SALON_NAME } from "../../../content/career";
import type { FairThemeId } from "../../../content/fairTheme";
import type { MenuTierId } from "../../../content/menuTier";
import {
  currentSeason,
  fairDayOf,
  fairTentByNumber,
  fairThemeById,
  nextSeasonStart,
  salonDayOf,
  seasonBegun,
  seasonByNumber,
  seasonThemes,
  type Action,
  type GameState,
  type SalonMenu,
} from "../../../core";
import type { PlayView } from "../../patisserieRoute";
import { CometRoomBackdrop } from "../../art/CometRoomBackdrop";
import { FairCard } from "./FairCard";
import { MenuBoard } from "./MenuBoard";
import { RibbonWall } from "./RibbonWall";
import { SalonPlan } from "./SalonPlan";
import { ThemePicker } from "./ThemePicker";
import "./season.css";

export interface SeasonPanelProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly once: (event: ClickLike, action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
}

function daysAway(day: number, target: number): string {
  const days = target - day;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return days > 0 ? `in ${days} days` : "done";
}

export function SeasonPanel({ state, dispatch, once, onOpen }: SeasonPanelProps) {
  const toast = useToast();
  const { fair, salon } = state;
  if (fair === null || salon === null) return null;
  const day = state.calendar.day;
  const season = currentSeason(fair);
  const begun = seasonBegun(fair, day);
  const theme = fair.themeId === null ? null : fairThemeById(fair.themeId);
  const preview =
    state.profile.trait === "trendsetter"
      ? seasonThemes(fair.seasonNumber + 1).map((entry) => entry.name)
      : [];
  const chooseTheme = (event: ClickLike, themeId: FairThemeId) => {
    if (once(event, { type: "chooseFairTheme", themeId }))
      toast("Marigold's Baker's Hamper is in the pantry!");
  };
  const confirmMenu = (event: ClickLike, menu: SalonMenu) => {
    if (once(event, { type: "setSalonMenu", menu })) toast("The Comet Room is open for bookings!");
  };
  const rest = (event: ClickLike) => {
    if (once(event, { type: "restParlour" }))
      toast("The parlour rests this season. Bakery rent only.", "info");
  };
  const bakeTray = (event: ClickLike, tier: MenuTierId) => {
    if (once(event, { type: "startSalonTray", tier })) onOpen("bake");
  };
  const openTables = (event: ClickLike) => {
    if (once(event, { type: "openTables" })) onOpen("salon");
  };
  const startShowpiece = (event: ClickLike) => {
    if (once(event, { type: "startShowpiece" })) onOpen("bake");
  };
  const moveUp = (event: ClickLike) => {
    if (once(event, { type: "moveUpTent" })) toast("You moved up a tent. Exciting!");
  };
  return (
    <section className="pa-season" aria-labelledby="pa-season-title" data-testid="season-panel">
      <header className="pa-season__ribbon">
        <CometRoomBackdrop className="pa-season__backdrop" glow={0.8} />
        <div className="pa-season__title">
          <span className="ad-eyebrow">
            {SALON_NAME} · Fair Season {fair.seasonNumber}
          </span>
          <h2 id="pa-season-title">
            {season.name}
            {theme !== null ? ` · ${theme.name}` : ""}
          </h2>
          <span className="pa-season__chips">
            <TagPill tone="gold">Tent: {fairTentByNumber(fair.tent).name}</TagPill>
            {begun && salon.parlour !== "resting" ? (
              <>
                <TagPill tone="sage">
                  <Icon name="heart" size={12} /> Salon Day {daysAway(day, salonDayOf(fair))}
                </TagPill>
                <TagPill tone="hot">
                  <Icon name="star" size={12} /> Fair Day {daysAway(day, fairDayOf(fair))}
                </TagPill>
              </>
            ) : null}
            {salon.parlour === "resting" ? <TagPill>Parlour resting</TagPill> : null}
          </span>
          {preview.length > 0 ? (
            <span className="pa-season__soon">
              <span className="pa-trends__ribbon">Soon</span> {seasonByNumber(fair.seasonNumber + 1).name}:{" "}
              {preview.join(" or ")}
            </span>
          ) : null}
        </div>
      </header>
      <div className="pa-season__body">
        {!begun ? (
          <p className="pa-season__wait">
            <Icon name="calendar" size={18} /> Fair Season {fair.seasonNumber} opens on day{" "}
            {fair.seasonStartDay}. Keep baking orders until then!
          </p>
        ) : salon.parlour === "resting" ? (
          <p className="pa-season__wait">
            <Icon name="heart" size={18} /> The parlour is resting until day {nextSeasonStart(fair)}. Bake
            orders and trays as a Corner Baker for now.
          </p>
        ) : fair.themeId === null ? (
          <ThemePicker state={state} onChoose={chooseTheme} />
        ) : salon.menu === null ? (
          <MenuBoard state={state} onConfirm={confirmMenu} onRest={rest} />
        ) : (
          <div className="pa-season__grid">
            <SalonPlan
              state={state}
              dispatch={dispatch}
              onBakeTray={bakeTray}
              onOpenTables={openTables}
              onOpen={onOpen}
            />
            <FairCard state={state} onStartShowpiece={startShowpiece} onMoveUp={moveUp} onOpen={onOpen} />
          </div>
        )}
        <RibbonWall fair={fair} />
      </div>
    </section>
  );
}
