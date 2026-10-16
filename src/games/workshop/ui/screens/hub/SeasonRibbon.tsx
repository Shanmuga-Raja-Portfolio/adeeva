import { Icon } from "../../../../../ui/kit/IconSet";
import {
  currentSeason,
  daysToFair,
  fairBoothByNumber,
  fairThemeById,
  seasonBegun,
  type GameState,
} from "../../../core";

function fairLine(state: GameState): string {
  const showroom = state.showroom;
  const fair = state.fair;
  if (showroom === null || fair === null) return "";
  if (!seasonBegun(showroom, state.calendar.day)) return `Season 1 starts on day ${showroom.seasonStartDay}`;
  if (showroom.rested) return "The shop is resting this season";
  if (fair.result !== null) return "Fair done. See you next season!";
  const days = daysToFair(showroom, state.calendar.day);
  if (days === 0) return "Fair Day is today!";
  if (days < 0) return "Last chance: a late booth today";
  return `Fair Day in ${days} ${days === 1 ? "day" : "days"}`;
}

export function SeasonRibbon({ state }: { readonly state: GameState }) {
  const showroom = state.showroom;
  const fair = state.fair;
  if (state.career !== "showroom" || showroom === null || fair === null) return null;
  const season = currentSeason(showroom);
  const theme = showroom.themeId === null ? null : fairThemeById(showroom.themeId);
  return (
    <p className={`ww-ribbon ww-ribbon--${season.id}`} data-testid="season-ribbon">
      <span className="ww-ribbon__season">
        <Icon name="sparkle" size={14} /> {season.name} · Season {showroom.seasonNumber}
      </span>
      <span>{theme === null ? "Theme: not chosen yet" : `Theme: ${theme.name}`}</span>
      <span>Booth: {fairBoothByNumber(fair.booth).name}</span>
      <strong>{fairLine(state)}</strong>
    </p>
  );
}
