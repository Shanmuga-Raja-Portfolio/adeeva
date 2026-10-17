import type { ReactNode } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { KEMI_LOOK } from "../../../content/panelMember";
import {
  BOARD_LAST_SEASON_DAY,
  canStartPiece,
  daysToLanternNight,
  launchDayKind,
  launchedSlot,
  launchMinimum,
  launchReady,
  launchStaged,
  launchThemeById,
  lineNameById,
  lineSeats,
  popupDone,
  productById,
  seasonDayOf,
  slotOnBench,
  type CollectionState,
  type GameState,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import type { PlayView } from "../../jewelleryRoute";
import { ThemeBadge } from "./ThemeBadge";

export interface LineCardProps {
  readonly state: GameState;
  readonly collection: CollectionState;
  readonly onOpen: (view: PlayView) => void;
  readonly onStartPiece: (event: ClickLike, slot: number) => void;
}

interface StepRowProps {
  readonly done: boolean;
  readonly title: string;
  readonly note: string;
  readonly testId: string;
  readonly children?: ReactNode;
}

function StepRow({ done, title, note, testId, children }: StepRowProps) {
  return (
    <li className={done ? "jb-line-step jb-line-step--done" : "jb-line-step"} data-testid={testId}>
      <span className="jb-line-step__mark" aria-hidden="true">
        {done ? <Icon name="check" size={16} /> : <span className="jb-line-step__dot" />}
      </span>
      <span className="jb-line-step__text">
        <strong>{title}</strong>
        <span>{note}</span>
      </span>
      {children === undefined ? null : <span className="jb-line-step__action">{children}</span>}
    </li>
  );
}

function nightNote(state: GameState, collection: CollectionState): string {
  const days = daysToLanternNight(collection, state.calendar.day);
  if (launchStaged(state, collection)) return "Launched under the lanterns!";
  if (days > 0)
    return `In ${days} ${days === 1 ? "day" : "days"}. Ready or not, the lanterns are lit for you.`;
  if (launchReady(state, collection))
    return days === 0 ? "Tonight! Stage your Launch." : "A late Launch is still open today.";
  return `Finish at least ${launchMinimum(state.profile.difficulty)} pieces to launch.`;
}

function popupNote(state: GameState, collection: CollectionState): string {
  const popup = state.launch?.popup;
  if (popup === undefined || popup === null || !popupDone(state, collection))
    return "The day after Lantern Night (3 h).";
  const sold = popup.entries.filter((entry) => entry.sold).length;
  return `${sold} of ${popup.entries.length} pieces found homes · +${popup.coins} coins.`;
}

export function LineCard({ state, collection, onOpen, onStartPiece }: LineCardProps) {
  const theme = collection.themeId === null ? null : launchThemeById(collection.themeId);
  const brief = collection.brief;
  const day = seasonDayOf(collection, state.calendar.day) ?? 0;
  const staged = launchStaged(state, collection);
  const allMade = brief !== null && collection.pieces.length === brief.products.length;
  const seats = brief === null ? 0 : lineSeats(brief);
  const canLaunch = launchDayKind(state) !== null && launchReady(state, collection);
  const popupOpen = staged && launchDayKind(state) === "late" && !popupDone(state, collection);
  const launchedCount = staged ? (state.launch?.result?.plan.order.length ?? 0) : 0;
  return (
    <Card
      tone="gold"
      eyebrow={`${lineNameById(collection.lineNameId).name} · Season ${collection.seasonNumber}`}
      title={theme === null ? "Your line" : theme.name}
      className="jb-hub-card jb-line-card"
      data-testid="line-card"
    >
      {theme !== null ? <ThemeBadge theme={theme} compact /> : null}
      {brief !== null ? (
        <div className="jb-line-tray" aria-label="Your line on its velvet tray">
          {brief.products.map((productId, slot) => {
            const piece = collection.pieces.find((entry) => entry.slot === slot);
            const launched = piece === undefined ? launchedSlot(state, collection, productId) : null;
            const onBench = slotOnBench(state, slot);
            const start = canStartPiece(state, slot);
            const name = productById(productId).name;
            return (
              <div key={slot} className="jb-line-tray__slot" data-testid={`line-slot-${slot}`}>
                {piece !== undefined ? (
                  <PiecePreview source={piece.look} title={`${name}, finished`} />
                ) : launched !== null ? (
                  <PiecePreview source={launched.look} title={`${name}, launched`} />
                ) : (
                  <span className="jb-line-tray__empty">
                    <Icon name="sparkle" size={20} />
                  </span>
                )}
                <span className="jb-line-tray__name">{name}</span>
                {piece !== undefined ? (
                  <span className="jb-line-tray__state">Quality {piece.quality}</span>
                ) : launched !== null ? (
                  <span className="jb-line-tray__state">
                    {launched.foundHome ? "Found a home" : "In the Line Drawer"}
                  </span>
                ) : onBench ? (
                  <Button size="sm" variant="secondary" onClick={() => onOpen("bench")}>
                    Back to the bench
                  </Button>
                ) : staged ? (
                  <span className="jb-line-tray__state">Not in this Launch</span>
                ) : (
                  <Button
                    size="sm"
                    onClick={(event) => onStartPiece(event, slot)}
                    disabledReason={start.ok ? undefined : start.reasons[0]}
                    data-testid={`start-line-${slot}`}
                  >
                    Make it
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
      <ol className="jb-line-steps">
        <StepRow
          done={brief !== null}
          title="Collection Board"
          note={
            brief !== null
              ? "Your line is planned."
              : day > BOARD_LAST_SEASON_DAY
                ? "The board closed on day 10 of the season."
                : "Choose the pieces, motif, metal and stones."
          }
          testId="step-board"
        >
          {brief === null && day <= BOARD_LAST_SEASON_DAY ? (
            <Button size="sm" onClick={() => onOpen("board")} data-testid="open-board">
              Open the board
            </Button>
          ) : null}
        </StepRow>
        {brief !== null && seats > 0 ? (
          <StepRow
            done={collection.gemSpent !== null}
            title="Pebble & Prism"
            note={
              collection.gemSpent !== null
                ? `Line Pot filled for ${collection.gemSpent} coins.`
                : `Auntie Kemi has a tray of stones for ${seats} ${seats === 1 ? "seat" : "seats"}.`
            }
            testId="step-gems"
          >
            {collection.gemSpent === null ? (
              <>
                <Avatar
                  look={KEMI_LOOK}
                  mood="happy"
                  size={44}
                  title="Auntie Kemi"
                  className="jb-line-step__face"
                />
                <Button size="sm" onClick={() => onOpen("gems")} data-testid="open-gems">
                  Visit the stall
                </Button>
              </>
            ) : null}
          </StepRow>
        ) : null}
        {brief !== null ? (
          <StepRow
            done={allMade || staged}
            title="Make the pieces"
            note={
              staged
                ? `${launchedCount} of ${brief.products.length} made for the Launch.`
                : `${collection.pieces.length} of ${brief.products.length} finished. Design is ready on each one.`
            }
            testId="step-pieces"
          />
        ) : null}
        {brief !== null ? (
          <StepRow
            done={collection.lookbook.closed}
            title="Lookbook"
            note={
              collection.lookbook.closed
                ? "Every photo is in the album."
                : allMade
                  ? "Style and light a photo of each piece (2 h)."
                  : "Opens once every piece is finished."
            }
            testId="step-lookbook"
          >
            {allMade || collection.lookbook.pages.length > 0 ? (
              <Button
                size="sm"
                variant={collection.lookbook.closed ? "secondary" : "primary"}
                onClick={() => onOpen("lookbook")}
                data-testid="open-lookbook"
              >
                {collection.lookbook.closed ? "See the album" : "Open the Lookbook"}
              </Button>
            ) : null}
          </StepRow>
        ) : null}
        {theme !== null ? (
          <StepRow
            done={staged}
            title="Lantern Night"
            note={nightNote(state, collection)}
            testId="step-launch"
          >
            {canLaunch || staged ? (
              <Button
                size="sm"
                variant={staged ? "secondary" : "primary"}
                onClick={() => onOpen("launch")}
                data-testid="open-launch"
              >
                {staged ? "See the Launch" : "Stage the Launch"}
              </Button>
            ) : null}
          </StepRow>
        ) : null}
        {theme !== null ? (
          <StepRow
            done={popupDone(state, collection)}
            title="Pop-up Window"
            note={popupNote(state, collection)}
            testId="step-popup"
          >
            {popupOpen ? (
              <Button size="sm" onClick={() => onOpen("popup")} data-testid="open-popup">
                Open the window
              </Button>
            ) : null}
          </StepRow>
        ) : null}
      </ol>
    </Card>
  );
}
