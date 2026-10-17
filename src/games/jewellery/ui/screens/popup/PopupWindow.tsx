import { useEffect, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { MENTOR_LOOK } from "../../../content/mentor";
import { PRICE_TAGS, type PriceTagId } from "../../../content/priceTag";
import {
  canOpenPopup,
  dearestTag,
  lanternById,
  lineNameById,
  marketPieces,
  MAX_SHELF,
  popupBoard,
  productById,
  salePrice,
  sells,
  shelfSells,
  sparkleBonus,
  tagPrice,
  type Action,
  type CollectionState,
  type GameState,
  type PopupBoardRow,
  type PopupResult,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import { LoftHeader } from "../loft/LoftHeader";
import { RadioCards } from "../launch/RadioCards";
import { PopupResults } from "./PopupResults";
import { PopupScene } from "./PopupScene";
import { PopupStroll } from "./PopupStroll";
import "../loft/loft.css";
import "../launch/launch.css";
import "./popup.css";

export interface PopupWindowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

interface Opened {
  readonly rows: readonly PopupBoardRow[];
  readonly tags: Readonly<Record<string, PriceTagId>>;
  readonly plinth: string;
}

function startingTags(rows: readonly PopupBoardRow[], relaxed: boolean): Record<string, PriceTagId> {
  return Object.fromEntries(rows.map((row) => [row.piece.id, relaxed ? dearestTag(row.hearts) : "fair"]));
}

function ArrangeView({
  state,
  dispatch,
  collection,
  onOpened,
}: PopupWindowProps & { readonly collection: CollectionState; readonly onOpened: (opened: Opened) => void }) {
  const once = useDispatchOnce(state, dispatch);
  const result = state.launch?.result ?? null;
  const firstRows = popupBoard(state, result?.plan.order[result.plan.order.length - 1] ?? "");
  const [plinth, setPlinth] = useState(result?.plan.order[result.plan.order.length - 1] ?? "");
  const [tags, setTags] = useState<Record<string, PriceTagId>>(() =>
    startingTags(firstRows, state.profile.difficulty === "relaxed"),
  );
  const [shelf, setShelf] = useState<readonly string[]>([]);
  useEffect(() => {
    focusHeading();
  }, []);
  if (result === null) return null;
  const rows = popupBoard(state, plinth);
  const extras = marketPieces(state);
  const shelfOpen = shelfSells(state);
  const choice = { plinth, tags, shelf };
  const check = canOpenPopup(state, choice);
  const lantern = lanternById(result.plan.lantern);
  const toggleShelf = (id: string) =>
    setShelf(
      shelf.includes(id)
        ? shelf.filter((entry) => entry !== id)
        : shelf.length >= MAX_SHELF
          ? shelf
          : [...shelf, id],
    );
  const open = (event: ClickLike) => {
    if (once(event, { type: "openPopup", plinth, tags, shelf })) onOpened({ rows, tags, plinth });
  };
  return (
    <>
      <PopupScene
        rows={rows.map((row) => ({
          piece: row.piece,
          hearts: row.hearts,
          tag: tags[row.piece.id] ?? "gentle",
        }))}
        plinth={plinth}
        lineName={lineNameById(collection.lineNameId).name}
        lantern={lantern.hex}
        label="Your Pop-up Window at the arcade gate"
      />
      <p className="jb-popup__osei" role="note">
        <Avatar look={MENTOR_LOOK} size={44} title="Mr. Osei" frameColour="#d9e9ea" />
        <span>
          {state.profile.difficulty === "relaxed"
            ? "Osei suggests… the dearest tag each piece's hearts can reach. Every piece holds at least 1 ♥, so Gentle always sells."
            : "Every piece holds at least 1 ♥. A Gentle tag always sells; spare hearts become copy requests."}
        </span>
      </p>
      <section className="jb-popup__plinth" aria-labelledby="jb-plinth-title">
        <h2 id="jb-plinth-title">Window plinth</h2>
        <p className="jb-hint">The plinth piece draws one extra heart.</p>
        <RadioCards<string>
          label="Window plinth"
          value={plinth}
          onChange={setPlinth}
          cards={rows.map((row) => ({
            value: row.piece.id,
            title: productById(row.piece.look.productId).name,
            sub: `${row.hearts} ♥`,
            testId: `plinth-${row.piece.slot}`,
          }))}
        />
      </section>
      <section className="jb-popup__tags" aria-labelledby="jb-tags-title">
        <h2 id="jb-tags-title">Price tags</h2>
        <ul className="jb-price-board">
          {rows.map((row) => {
            const tag = tags[row.piece.id] ?? "gentle";
            const selling = sells(row.hearts, tag);
            const name = productById(row.piece.look.productId).name;
            return (
              <li key={row.piece.id} className="jb-price-row" data-testid={`price-row-${row.piece.slot}`}>
                <PiecePreview source={row.piece.look} title={null} className="jb-price-row__art" />
                <div className="jb-price-row__info">
                  <strong>{name}</strong>
                  <span className="jb-price-row__hearts" data-testid={`hearts-${row.piece.slot}`}>
                    {row.hearts} ♥
                  </span>
                  <span className="jb-muted">
                    Fair price {row.fair} · Sparkle bonus +{sparkleBonus(row.piece)}
                  </span>
                </div>
                <RadioCards<PriceTagId>
                  label={`Price tag for ${name}`}
                  value={tag}
                  onChange={(next) => setTags({ ...tags, [row.piece.id]: next })}
                  cards={PRICE_TAGS.map((def) => ({
                    value: def.id,
                    title: `${def.name} · ${tagPrice(row.fair, def.id)}`,
                    sub: `needs ${def.hearts} ♥`,
                    testId: `tag-${row.piece.slot}-${def.id}`,
                  }))}
                />
                <span
                  className={selling ? "jb-sells jb-sells--yes" : "jb-sells"}
                  data-testid={`sells-${row.piece.slot}`}
                >
                  {selling
                    ? "sells"
                    : state.profile.difficulty === "relaxed"
                      ? "a visitor may come back"
                      : "waits in the drawer"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      {extras.length > 0 ? (
        <section className="jb-popup__shelf" aria-labelledby="jb-shelf-title">
          <h2 id="jb-shelf-title">
            Little shelf · {shelf.length} of {MAX_SHELF}
          </h2>
          <p className="jb-hint">
            {shelfOpen
              ? "Stall pieces and Line Drawer pieces sell here at their Market Day price."
              : "The Little shelf sells when the Launch scores 35 or more."}
          </p>
          <div className="jb-popup__shelf-items">
            {extras.map((piece) => {
              const on = shelf.includes(piece.id);
              return (
                <button
                  key={piece.id}
                  type="button"
                  className={on ? "jb-shelf-item jb-shelf-item--on" : "jb-shelf-item"}
                  aria-pressed={on}
                  disabled={!on && shelf.length >= MAX_SHELF}
                  onClick={() => toggleShelf(piece.id)}
                  data-testid={`shelf-${piece.id}`}
                >
                  <PiecePreview source={piece.look} title={null} />
                  <span>{productById(piece.look.productId).name}</span>
                  <span className="jb-muted">
                    <Icon name="coin" size={12} /> {salePrice(piece, result.overall)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      <footer className="jb-launch-board__foot">
        <Button
          size="lg"
          icon="sparkle"
          onClick={open}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="open-window"
        >
          Open the window · 3 h
        </Button>
      </footer>
    </>
  );
}

function WindowView({
  state,
  dispatch,
  onExit,
  collection,
}: PopupWindowProps & { readonly collection: CollectionState }) {
  const { reducedMotion } = useSettings();
  const [opened, setOpened] = useState<Opened | null>(null);
  const [strolled, setStrolled] = useState(false);
  const popup: PopupResult | null = state.launch?.popup ?? null;
  const done = popup !== null && popup.seasonNumber === collection.seasonNumber;
  const result = state.launch?.result ?? null;
  const lantern = result === null ? "#f2a93b" : lanternById(result.plan.lantern).hex;
  const lineName = lineNameById(collection.lineNameId).name;
  return (
    <main className="jb-popup ad-screen" data-testid="popup-window">
      <LoftHeader
        state={state}
        eyebrow="Pop-up Day · the arcade gate"
        title="Pop-up Window"
        onExit={onExit}
      />
      {!done ? (
        <ArrangeView
          state={state}
          dispatch={dispatch}
          onExit={onExit}
          collection={collection}
          onOpened={setOpened}
        />
      ) : null}
      {done && opened !== null && !strolled ? (
        <PopupStroll
          opened={opened}
          lineName={lineName}
          lantern={lantern}
          reduced={reducedMotion}
          onDone={() => setStrolled(true)}
        />
      ) : null}
      {done && (opened === null || strolled) && popup !== null ? (
        <PopupResults
          popup={popup}
          rows={opened?.rows ?? []}
          pending={state.launch?.pendingCopies ?? []}
          onExit={onExit}
        />
      ) : null}
    </main>
  );
}

export function PopupWindow(props: PopupWindowProps) {
  const collection = props.state.collection;
  if (collection === null) return null;
  return <WindowView {...props} collection={collection} />;
}
