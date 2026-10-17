import { useState } from "react";
import { colourById } from "../../../../../engine/palette";
import { useToast } from "../../../../../studio/ToastContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { FINISHES, type FinishId } from "../../../content/finish";
import { GLAZE_COLOURS, type GlazeColour } from "../../../content/jewelColour";
import { MENTOR_LOOK } from "../../../content/mentor";
import { METALS, type MetalId } from "../../../content/metal";
import { SHAPE_IDS, type ShapeId } from "../../../content/partOption";
import { PRODUCTS, type ProductId } from "../../../content/product";
import { STONES, type StoneId } from "../../../content/stone";
import {
  benchHoursEstimate,
  boardIssues,
  canConfirmCollection,
  collectionBrief,
  gemBudget,
  harmonyMeter,
  launchThemeById,
  metalLocked,
  optionById,
  oseiSuggestion,
  productById,
  spotByNumber,
  stoneLocked,
  workingHoursLeft,
  type Action,
  type CollectionState,
  type GameState,
} from "../../../core";
import { metalLook } from "../../art/metalLook";
import { PiecePreview } from "../../art/PiecePreview";
import { ShapeThumb } from "../../art/ShapeThumb";
import { GemArt } from "../../art/GemArt";
import { ChoiceGrid } from "../bench/ChoiceGrid";
import { LoftHeader } from "../loft/LoftHeader";
import { ThemeBadge } from "../loft/ThemeBadge";
import { draftBrief, draftMissing, previewSource, startingDraft, type BoardDraft } from "./boardDraft";
import "../bench/bench.css";
import "../bench/design.css";
import "../bench/display.css";
import "../loft/loft.css";
import "./board.css";

export interface CollectionBoardProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const NONE = "none";

function BoardView({
  state,
  dispatch,
  onExit,
  collection,
}: CollectionBoardProps & { readonly collection: CollectionState }) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [draft, setDraft] = useState<BoardDraft>(() => startingDraft(state, collection));
  const launch = state.launch;
  const theme = collection.themeId === null ? null : launchThemeById(collection.themeId);
  if (launch === null || theme === null) return null;
  const spot = spotByNumber(launch.spot);
  const guide = collectionBrief(theme, launch.spot, state.profile.difficulty);
  const brief = draftBrief(draft);
  const missing = draftMissing(draft);
  const issues = brief === null ? [] : boardIssues(state, brief);
  const check = brief === null ? null : canConfirmCollection(state, brief);
  const reason = missing ?? (check === null || check.ok ? undefined : check.reasons[0]);
  const harmony = brief === null ? null : harmonyMeter(brief);
  const hours = brief === null ? null : benchHoursEstimate(collection, brief);
  const left = workingHoursLeft(state, collection);
  const suggestion = oseiSuggestion(state, collection);
  const update = (patch: Partial<BoardDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const toggleProduct = (productId: ProductId) =>
    setDraft((current) => ({
      ...current,
      products: current.products.includes(productId)
        ? current.products.filter((id) => id !== productId)
        : current.products.length >= spot.maxPieces
          ? current.products
          : [...current.products, productId],
    }));
  const seated = draft.products.some((id) => productById(id).seats.length > 0);
  const paired = draft.products.some((id) => productById(id).seats.length === 2);
  const confirm = (event: ClickLike) => {
    if (brief !== null && once(event, { type: "confirmCollection", brief })) {
      toast("Your line is on the board! Auntie Kemi is setting out her stones.");
      onExit();
    }
  };
  const stoneChoices = (allowNone: boolean) => [
    ...(allowNone
      ? [{ value: NONE, label: "No stone", content: <span className="jb-choice__name">None</span> }]
      : []),
    ...STONES.map((stone) => {
      const locked = stoneLocked(state, stone.id);
      return {
        value: stone.id as string,
        label: `${stone.name}${locked ? `, unlocks at reputation ${stone.minReputation}` : ""}`,
        disabled: locked,
        content: (
          <>
            <svg className="jb-stone-thumb" viewBox="-20 -20 40 40" aria-hidden="true">
              <GemArt stoneId={stone.id} tint="true" shimmer={1} size={30} />
            </svg>
            <span className="jb-choice__name">{stone.name}</span>
            {locked ? (
              <span className="jb-choice__sub">
                <Icon name="lock" size={12} /> Rep {stone.minReputation}
              </span>
            ) : null}
          </>
        ),
      };
    }),
  ];
  return (
    <main className="jb-board ad-screen" data-testid="collection-board">
      <LoftHeader
        state={state}
        eyebrow={`Season ${collection.seasonNumber} · ${spot.name}`}
        title="Collection Board"
        onExit={onExit}
      />
      <div className="jb-board__layout">
        <div className="jb-board__picks">
          <section className="jb-board__theme">
            <h2>{theme.name}</h2>
            <ThemeBadge theme={theme} />
            <p className="jb-muted">{theme.blurb}</p>
          </section>
          <div className="jb-board__osei">
            <Avatar look={MENTOR_LOOK} size={52} title="Mr. Osei" frameColour="#d9e9ea" />
            <p>
              {state.profile.difficulty === "relaxed"
                ? "Osei suggests… a line that fits the theme. Change anything you like, then confirm!"
                : suggestion === null
                  ? "Pick pieces that share one motif and one metal."
                  : `Osei's tip: a ${optionById(suggestion.motif).name} motif feels just right for ${theme.name}.`}
            </p>
          </div>
          <section className="jb-design__group">
            <h3>
              Pieces · {draft.products.length} of{" "}
              {spot.minPieces === spot.maxPieces ? spot.maxPieces : `${spot.minPieces}–${spot.maxPieces}`}
            </h3>
            <div className="jb-board__products" role="group" aria-label="Pieces in the line">
              {PRODUCTS.map((product) => {
                const on = draft.products.includes(product.id);
                const full = !on && draft.products.length >= spot.maxPieces;
                return (
                  <button
                    key={product.id}
                    type="button"
                    className={on ? "jb-board-product jb-board-product--on" : "jb-board-product"}
                    aria-pressed={on}
                    disabled={full}
                    onClick={() => toggleProduct(product.id)}
                    data-testid={`board-product-${product.id}`}
                  >
                    <PiecePreview source={previewSource(draft, product.id)} title={null} />
                    <span className="jb-choice__name">{product.name}</span>
                    <span className="jb-choice__sub">{product.kind}</span>
                    {on ? (
                      <span className="jb-board-product__slot">{draft.products.indexOf(product.id) + 1}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
          <section className="jb-design__group">
            <h3>Motif</h3>
            <ChoiceGrid<ShapeId>
              label="Motif"
              value={draft.motif}
              onChange={(motif) => update({ motif })}
              choices={SHAPE_IDS.map((id) => ({
                value: id,
                label: optionById(id).name,
                content: (
                  <>
                    <ShapeThumb optionId={id} />
                    <span className="jb-choice__name">{optionById(id).name}</span>
                    <span className="jb-choice__sub">{optionById(id).tags.join(", ")}</span>
                  </>
                ),
              }))}
            />
          </section>
          <section className="jb-design__group">
            <h3>Metal for every piece</h3>
            <ChoiceGrid<MetalId>
              label="Metal"
              value={draft.metalId}
              onChange={(metalId) => update({ metalId })}
              choices={METALS.map((metal) => {
                const locked = metalLocked(state, metal.id);
                const look = metalLook(metal.id, "high-shine");
                return {
                  value: metal.id,
                  label: `${metal.name}${locked ? `, unlocks at reputation ${metal.minReputation}` : ""}`,
                  disabled: locked,
                  content: (
                    <>
                      <span
                        className="jb-metal-swatch"
                        style={{
                          background: `linear-gradient(135deg, ${look.light}, ${look.mid} 55%, ${look.dark})`,
                        }}
                      />
                      <span className="jb-choice__name">{metal.name}</span>
                      <span className="jb-choice__sub">
                        {locked ? (
                          <>
                            <Icon name="lock" size={12} /> Rep {metal.minReputation}
                          </>
                        ) : (
                          "✦".repeat(metal.sparkle)
                        )}
                      </span>
                    </>
                  ),
                };
              })}
            />
          </section>
          {seated ? (
            <section className="jb-design__group">
              <h3>Hero stone</h3>
              <ChoiceGrid<string>
                label="Hero stone"
                className="jb-choices--stones"
                value={draft.hero ?? NONE}
                onChange={(value) => update({ hero: value === NONE ? null : (value as StoneId) })}
                choices={stoneChoices(false)}
              />
            </section>
          ) : null}
          {paired ? (
            <section className="jb-design__group">
              <h3>Accent stone for pairs</h3>
              <ChoiceGrid<string>
                label="Accent stone"
                className="jb-choices--stones"
                value={draft.accent ?? NONE}
                onChange={(value) => update({ accent: value === NONE ? null : (value as StoneId) })}
                choices={stoneChoices(true)}
              />
            </section>
          ) : null}
          <section className="jb-design__group">
            <h3>One finish for the line</h3>
            <ChoiceGrid<FinishId>
              label="Finish"
              value={draft.finish}
              onChange={(finish) =>
                update({ finish, glaze: finish === "glaze" ? (draft.glaze ?? "sky") : null })
              }
              choices={FINISHES.map((finish) => ({
                value: finish.id,
                label: `${finish.name}, ${finish.price} coins a piece`,
                content: (
                  <>
                    <span className={`jb-finish-chip jb-finish-chip--${finish.id}`} />
                    <span className="jb-choice__name">{finish.name}</span>
                    <span className="jb-choice__sub">
                      <Icon name="coin" size={12} /> {finish.price}
                    </span>
                  </>
                ),
              }))}
            />
            {draft.finish === "glaze" ? (
              <ChoiceGrid<GlazeColour>
                label="Glaze colour"
                className="jb-choices--swatches"
                value={draft.glaze}
                onChange={(glaze) => update({ glaze })}
                choices={GLAZE_COLOURS.map((colour) => ({
                  value: colour,
                  label: colourById(colour).name,
                  content: <span className="jb-swatch" style={{ background: colourById(colour).hex }} />,
                }))}
              />
            ) : null}
          </section>
        </div>
        <aside className="jb-board__preview" aria-label="Your line">
          <div className="jb-board__tray" data-testid="board-tray">
            {draft.products.length === 0 ? (
              <p className="jb-board__empty">Tap pieces to lay them on the velvet tray.</p>
            ) : (
              draft.products.map((productId, slot) => (
                <figure key={productId} className="jb-board__tray-piece">
                  <PiecePreview
                    source={previewSource(draft, productId)}
                    title={productById(productId).name}
                  />
                  <figcaption>
                    {slot + 1}. {productById(productId).name}
                  </figcaption>
                </figure>
              ))
            )}
          </div>
          <Meter
            label="Harmony"
            value={harmony?.score ?? 0}
            max={100}
            valueText={harmony === null ? "—" : `${harmony.score} / 100`}
            tone="gold"
          />
          {harmony !== null ? (
            <p className="jb-hint" data-testid="harmony-detail">
              Motif on {Math.round(harmony.motifShare * 100)}% of pieces · colours{" "}
              {Math.round(harmony.cohesion * 100)}% in tune
            </p>
          ) : null}
          <ul className="jb-board__checks">
            <li>
              <Icon name="star" size={14} /> Ready for Lantern Night at {guide.minQuality}. Ready or not, the
              lanterns are lit for you.
            </li>
            {brief !== null && seated ? (
              <li>
                <Icon name="coin" size={14} /> Stone budget at Pebble &amp; Prism:{" "}
                {gemBudget(brief, launch.spot)} coins
              </li>
            ) : null}
            {hours !== null ? (
              <li
                className={hours > left ? "jb-board__hours jb-board__hours--tight" : "jb-board__hours"}
                data-testid="board-hours"
              >
                <Icon name="clock" size={14} /> About {hours} h of bench work · {left} working hours left
                before Lantern Night
              </li>
            ) : null}
            {collection.lineSheets.length > 0 ? (
              <li>
                <Icon name="sparkle" size={14} /> Line sheets are cleared after Lantern Night.
              </li>
            ) : null}
            {[missing, ...issues]
              .filter((issue): issue is string => issue !== null)
              .map((issue) => (
                <li key={issue} className="jb-board__issue">
                  <Icon name="close" size={14} /> {issue}
                </li>
              ))}
          </ul>
          <div className="jb-board__actions">
            {suggestion !== null && state.profile.difficulty === "relaxed" ? (
              <Button variant="secondary" onClick={() => setDraft(suggestion)} data-testid="osei-suggests">
                Osei suggests…
              </Button>
            ) : null}
            <Button
              size="lg"
              icon="check"
              onClick={confirm}
              disabledReason={reason}
              showReason
              data-testid="confirm-board"
            >
              Confirm the line · 1 h
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function CollectionBoard(props: CollectionBoardProps) {
  const collection = props.state.collection;
  if (collection === null) return null;
  return <BoardView {...props} collection={collection} />;
}
