import { dishById, festivalById, festivalToday, type GameState } from "../../core";
import { restaurantName } from "../screens/path/restaurantName";
import { FestivalScene } from "./FestivalScene";
import { HEADROOM_VIEWBOX } from "./KitchenBackdrop";
import { SceneDefs, useSceneIds } from "./kitchenFixtures";
import { QuaysideScene } from "./QuaysideScene";
import { StudioScene } from "./StudioScene";

export interface PathBackdropProps {
  readonly state: GameState;
  readonly headroom?: boolean | undefined;
  readonly className?: string | undefined;
}

function Scene({ state }: { readonly state: GameState }) {
  const ids = useSceneIds();
  const path = state.path;
  if (path === null) return null;
  if (path.kind === "restaurant")
    return (
      <>
        <SceneDefs ids={ids} />
        <QuaysideScene
          ids={ids}
          sign={restaurantName(state)}
          menu={path.menu.map((entry) => dishById(entry.dishId).name)}
        />
      </>
    );
  if (path.kind === "truck") {
    const slot = festivalToday(path, state.calendar.day) ?? path.board[0] ?? null;
    const festival =
      slot === null ? festivalById(path.cycle[0] ?? "kite-day") : festivalById(slot.festivalId);
    return (
      <FestivalScene
        sky={festival.sky}
        flag={festival.flag}
        menu={path.menu.map((entry) => dishById(entry.dishId).name)}
        ribbons={path.ribbons.length}
      />
    );
  }
  const cards =
    path.book === null ? 0 : path.book.chapters.reduce((sum, chapter) => sum + chapter.cards.length, 0);
  return (
    <>
      <SceneDefs ids={ids} />
      <StudioScene ids={ids} books={cards} />
    </>
  );
}

export function PathBackdrop({ state, headroom = false, className }: PathBackdropProps) {
  return (
    <svg
      viewBox={headroom ? HEADROOM_VIEWBOX : "0 0 1200 600"}
      preserveAspectRatio={headroom ? "xMidYMax slice" : "xMidYMid slice"}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <Scene state={state} />
    </svg>
  );
}
