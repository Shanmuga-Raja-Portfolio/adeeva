import { Icon } from "../../../../../ui/kit/IconSet";
import {
  canEndDay,
  daysToLanternNight,
  launchStaged,
  launchThemeById,
  popupDone,
  seasonByNumber,
  seasonDayOf,
  spotByNumber,
  type GameState,
} from "../../../core";

function nightLine(state: GameState): string {
  const collection = state.collection;
  if (collection === null) return "";
  const day = seasonDayOf(collection, state.calendar.day);
  if (day === null) return `Season ${collection.seasonNumber} starts on day ${collection.seasonStartDay}`;
  if (collection.rested) return "The line is resting this season";
  if (popupDone(state, collection)) return "Pop-up done. See you next season!";
  if (launchStaged(state, collection)) return "Launched! Pop-up Window next";
  const days = daysToLanternNight(collection, state.calendar.day);
  if (days === 0) return "Lantern Night is tonight!";
  if (days < 0)
    return canEndDay(state).ok ? "Your line carries on to next season" : "Last chance: a late Launch today";
  return `${days} ${days === 1 ? "day" : "days"} to Lantern Night`;
}

export function SeasonRibbon({ state }: { readonly state: GameState }) {
  const collection = state.collection;
  const launch = state.launch;
  if (state.career !== "collection" || collection === null || launch === null) return null;
  const season = seasonByNumber(collection.seasonNumber);
  const theme = collection.themeId === null ? null : launchThemeById(collection.themeId);
  return (
    <p className={`jb-ribbon jb-ribbon--${season.id}`} data-testid="season-ribbon">
      <span className="jb-ribbon__season">
        <Icon name="sparkle" size={14} /> Season {collection.seasonNumber} · {season.name}
      </span>
      <span>{theme === null ? "Theme not chosen yet" : theme.name}</span>
      <span>{spotByNumber(launch.spot).name}</span>
      <strong>{nightLine(state)}</strong>
    </p>
  );
}
