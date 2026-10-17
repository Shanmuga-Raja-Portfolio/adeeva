import { useEffect, useState } from "react";
import { normalisedRotation, type PlacedPose } from "../../../../../engine/placedPose";
import { useSettings } from "../../../../../studio/SettingsContext";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Meter } from "../../../../../ui/kit/Meter";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { BACKDROPS, type BackdropId } from "../../../content/lookbookBackdrop";
import { PROPS, type PropId } from "../../../content/lookbookProp";
import {
  backdropById,
  canCloseLookbook,
  launchThemeById,
  lightBand,
  lookbookCollection,
  MAX_PROPS,
  oseiPage,
  pageScore,
  productById,
  PROP_ROTATION_STEP,
  propCoversPiece,
  snappedLight,
  styleIssue,
  type Action,
  type CollectionPiece,
  type CollectionState,
  type GameState,
  type PropChoice,
} from "../../../core";
import { BackdropArt } from "../../art/BackdropArt";
import { PropArt } from "../../art/PropArt";
import { LoftHeader } from "../loft/LoftHeader";
import { LookbookAlbum } from "./LookbookAlbum";
import { PhotoStage } from "./PhotoStage";
import "../bench/bench.css";
import "../bench/design.css";
import "../loft/loft.css";
import "./lookbook.css";

export interface LookbookProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const SPOTS: readonly (readonly [number, number])[] = [
  [36, 196],
  [204, 196],
  [36, 44],
  [204, 44],
  [120, 214],
  [32, 120],
  [208, 120],
];

function asChoices(props: readonly (PropChoice & { readonly id?: string })[]): PropChoice[] {
  return props.map((prop) => ({
    propId: prop.propId,
    x: prop.x,
    y: prop.y,
    rotation: prop.rotation,
    scale: prop.scale,
    layer: prop.layer,
  }));
}

function freeSpot(props: readonly PropChoice[]): readonly [number, number] | null {
  return (
    SPOTS.find(([x, y]) => {
      const pose = { x, y, rotation: 0, scale: 1, layer: 0 };
      return !propCoversPiece(pose) && props.every((prop) => Math.hypot(prop.x - x, prop.y - y) > 30);
    }) ?? null
  );
}

interface PageEditorProps extends LookbookProps {
  readonly collection: CollectionState;
  readonly piece: CollectionPiece;
}

function PageEditor({ state, dispatch, collection, piece }: PageEditorProps) {
  const toast = useToast();
  const { reducedMotion } = useSettings();
  const page = collection.lookbook.pages.find((entry) => entry.pieceId === piece.id);
  const suggestion = state.profile.difficulty === "relaxed" ? oseiPage(collection) : null;
  const backdrop: BackdropId = page?.backdrop ?? suggestion?.backdrop ?? "linen";
  const props = asChoices(page?.props ?? suggestion?.props ?? []);
  const [angle, setAngle] = useState(page?.lampAngle ?? 0);
  const [assist, setAssist] = useState(page?.assisted ?? false);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const band = lightBand(state);
  const helped = assist || page?.assisted === true;
  const shownAngle = assist ? piece.sweetSpot : angle;
  const live = snappedLight(shownAngle, piece.sweetSpot, band, helped);
  const theme = collection.themeId === null ? null : launchThemeById(collection.themeId);

  useEffect(() => {
    if (page === undefined) dispatch({ type: "styleLookbookPage", pieceId: piece.id, backdrop, props });
  }, [page, dispatch, piece.id, backdrop, props]);

  const style = (nextBackdrop: BackdropId, nextProps: readonly PropChoice[]) => {
    const issue = styleIssue(nextProps);
    if (issue !== null) {
      setHint(issue);
      return;
    }
    setHint(null);
    dispatch({ type: "styleLookbookPage", pieceId: piece.id, backdrop: nextBackdrop, props: nextProps });
  };
  const addProp = (propId: PropId) => {
    if (props.length >= MAX_PROPS) {
      setHint(`Up to ${MAX_PROPS} props on a page.`);
      return;
    }
    const spot = freeSpot(props);
    if (spot === null) {
      setHint("No room left around the piece.");
      return;
    }
    const layer = props.reduce((top, prop) => Math.max(top, prop.layer), 0) + 1;
    style(backdrop, [...props, { propId, x: spot[0], y: spot[1], rotation: 0, scale: 1, layer }]);
    setSelected(props.length);
  };
  const moveProp = (index: number, pose: PlacedPose) => {
    const next = props.map((prop, at) => (at === index ? { ...prop, ...pose } : prop));
    style(backdrop, next);
  };
  const turn = (step: number) => {
    const prop = selected === null ? undefined : props[selected];
    if (prop === undefined || selected === null) return;
    moveProp(selected, { ...prop, rotation: normalisedRotation(prop.rotation + step) });
  };
  const remove = () => {
    if (selected === null) return;
    style(
      backdrop,
      props.filter((_, at) => at !== selected),
    );
    setSelected(null);
  };
  const snap = () => {
    if (dispatch({ type: "snapLookbookPage", pieceId: piece.id, lampAngle: shownAngle, assisted: assist }))
      toast(`Snap! ${productById(piece.look.productId).name} glows at ${Math.round(live * 100)}% light.`);
  };
  const others = collection.pieces.length > 1;
  return (
    <div className="jb-lookbook__editor">
      <div className="jb-lookbook__photo">
        <PhotoStage
          backdrop={backdrop}
          props={props}
          piece={piece.look}
          light={live}
          angle={shownAngle}
          lampLocked={assist}
          selected={selected}
          reducedMotion={reducedMotion}
          onAngle={setAngle}
          onSelect={setSelected}
          onMoveProp={moveProp}
        />
        {reducedMotion ? (
          <Meter
            label="Glint"
            value={Math.round(live * 100)}
            max={100}
            valueText={`${Math.round(live * 100)}%`}
            tone="gold"
          />
        ) : null}
        <div className="jb-lookbook__snap-row">
          <button type="button" className="jb-snap" onClick={snap} data-testid="snap-page">
            Snap
          </button>
          <p className="jb-hint">
            {page?.light !== null && page?.light !== undefined
              ? `Last snap: ${Math.round(page.light * 100)}% light. Snap again any time before you close the book.`
              : "Drag the little lamp round the ring. Watch the glint grow, then Snap!"}
          </p>
        </div>
      </div>
      <div className="jb-lookbook__controls">
        <section className="jb-design__group">
          <h3>Backdrop</h3>
          <div className="jb-lookbook__backdrops" role="radiogroup" aria-label="Backdrop">
            {BACKDROPS.map((def) => (
              <button
                key={def.id}
                type="button"
                role="radio"
                aria-checked={def.id === backdrop}
                className={def.id === backdrop ? "jb-backdrop-card jb-backdrop-card--on" : "jb-backdrop-card"}
                onClick={() => style(def.id, props)}
                data-testid={`backdrop-${def.id}`}
              >
                <svg viewBox="0 0 240 240" aria-hidden="true">
                  <BackdropArt backdrop={def.id} />
                </svg>
                <span className="jb-choice__name">{def.name}</span>
                <span className="jb-choice__sub">{def.word}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="jb-design__group">
          <h3>
            Props · {props.length} of {MAX_PROPS}
          </h3>
          <div className="jb-lookbook__props">
            {PROPS.map((def) => (
              <button
                key={def.id}
                type="button"
                className="jb-prop-tile"
                onClick={() => addProp(def.id)}
                aria-label={`Add ${def.name}`}
                data-testid={`prop-${def.id}`}
              >
                <svg viewBox="-24 -24 48 48" aria-hidden="true">
                  <PropArt propId={def.id} />
                </svg>
                <span>{def.name}</span>
              </button>
            ))}
          </div>
          {selected !== null && props[selected] !== undefined ? (
            <div className="jb-tools">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => turn(-PROP_ROTATION_STEP)}
                aria-label="Turn prop left"
              >
                ⟲
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => turn(PROP_ROTATION_STEP)}
                aria-label="Turn prop right"
              >
                ⟳
              </Button>
              <Button variant="ghost" size="sm" onClick={remove}>
                Take it away
              </Button>
            </div>
          ) : null}
          <p
            className={hint === null ? "jb-hint-line" : "jb-hint-line jb-hint-line--warn"}
            aria-live="polite"
          >
            {hint ?? "Props sit around the piece, never on top of it."}
          </p>
        </section>
        <ToggleSwitch
          label="Osei's lamp"
          description={
            page?.assisted === true
              ? "Mr. Osei lit this page, so it counts up to 80% from now on."
              : "Mr. Osei finds the sweet spot for you. A page lit this way counts up to 80%."
          }
          checked={assist}
          onChange={setAssist}
        />
        {others ? (
          <Button
            variant="secondary"
            onClick={() => {
              if (dispatch({ type: "styleEveryPage", fromPieceId: piece.id }))
                toast("Every page has this styling now. Only the lamps are left!");
            }}
            data-testid="style-every-page"
          >
            Use this styling for every page
          </Button>
        ) : null}
        {theme !== null ? (
          <p className="jb-hint">
            Styling for {theme.name}: {pageScore(page, theme)} / 100. The {backdropById(theme.backdrop).name}{" "}
            backdrop and props that feel {theme.tags.join(" or ")} suit it best.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EditorView({
  state,
  dispatch,
  onExit,
  collection,
}: LookbookProps & { readonly collection: CollectionState }) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [current, setCurrent] = useState(collection.pieces[0]?.id ?? "");
  const piece = collection.pieces.find((entry) => entry.id === current) ?? collection.pieces[0];
  const check = canCloseLookbook(state);
  const [confirming, setConfirming] = useState(false);
  const unsnapped = collection.pieces.filter(
    (entry) => (collection.lookbook.pages.find((page) => page.pieceId === entry.id)?.light ?? null) === null,
  ).length;
  const unsnappedNote = `${unsnapped} ${unsnapped === 1 ? "page isn't" : "pages aren't"} snapped yet`;
  const close = (event: ClickLike) => {
    setConfirming(false);
    if (once(event, { type: "closeLookbook" }))
      toast("The Lookbook is closed and every photo is in the album!");
  };
  const askToClose = (event: ClickLike) => {
    if (unsnapped > 0) setConfirming(true);
    else close(event);
  };
  if (piece === undefined) return null;
  return (
    <main className="jb-lookbook ad-screen" data-testid="lookbook">
      <LoftHeader state={state} eyebrow="The Lantern Loft" title="Lookbook" onExit={onExit} />
      <ol className="jb-lookbook__strip" aria-label="Pages">
        {collection.pieces.map((entry, index) => {
          const page = collection.lookbook.pages.find((candidate) => candidate.pieceId === entry.id);
          const lit = page?.light ?? null;
          return (
            <li key={entry.id}>
              <button
                type="button"
                className={entry.id === piece.id ? "jb-page-tab jb-page-tab--on" : "jb-page-tab"}
                aria-pressed={entry.id === piece.id}
                onClick={() => setCurrent(entry.id)}
                data-testid={`page-tab-${index}`}
              >
                <span>
                  Page {index + 1} · {productById(entry.look.productId).name}
                </span>
                <span className="jb-page-tab__state">
                  {lit === null ? "Not snapped" : `${Math.round(lit * 100)}% light`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <PageEditor
        key={piece.id}
        state={state}
        dispatch={dispatch}
        onExit={onExit}
        collection={collection}
        piece={piece}
      />
      <footer className="jb-lookbook__footer">
        {check.ok && unsnapped > 0 ? (
          <p className="jb-hint-line jb-hint-line--warn" data-testid="unsnapped-note">
            {unsnappedNote}.
          </p>
        ) : null}
        <Button
          size="lg"
          icon="check"
          onClick={askToClose}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="close-lookbook"
        >
          Close the Lookbook · 2 h
        </Button>
      </footer>
      <Dialog
        open={confirming}
        title="Close the Lookbook now?"
        onClose={() => setConfirming(false)}
        footer={
          <>
            <Button variant="ghost" autoFocus onClick={() => setConfirming(false)}>
              Keep snapping
            </Button>
            <Button onClick={close} data-testid="confirm-close-lookbook">
              Close it anyway
            </Button>
          </>
        }
      >
        <p>{unsnappedNote}.</p>
        <p className="jb-muted">
          A missing page shows its piece on a plain slide, and the Lookbook can't be opened again this season.
        </p>
      </Dialog>
    </main>
  );
}

export function Lookbook(props: LookbookProps) {
  const editing = lookbookCollection(props.state);
  const collection = props.state.collection;
  if (editing !== null) return <EditorView {...props} collection={editing} />;
  if (collection === null) return null;
  return <LookbookAlbum state={props.state} collection={collection} onExit={props.onExit} />;
}
