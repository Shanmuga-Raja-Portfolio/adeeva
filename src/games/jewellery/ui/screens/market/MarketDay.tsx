import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { jewelColourById } from "../../../content/jewelColour";
import { TRAY_CLOTHS, TRAY_SIGNS, TRAY_SLOTS, type TrayClothId } from "../../../content/stallTray";
import {
  canShowTray,
  fitsTheme,
  MARKET_HOURS,
  productById,
  shopperScore,
  themeById,
  type Action,
  type GameState,
  type MarketSummary,
  type StallPiece,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import { StallFront } from "../../art/StallFront";
import "./market.css";

interface MarketDayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const SLOT_NAMES = ["Left", "Centre", "Right"] as const;

function clothHex(id: TrayClothId): string {
  return TRAY_CLOTHS.find((cloth) => cloth.id === id)?.hex ?? "#1f4e5a";
}

function Summary({ summary, onExit }: { readonly summary: MarketSummary; readonly onExit: () => void }) {
  const theme = themeById(summary.themeId);
  const soldIds = new Set(summary.sold.map((sale) => sale.pieceId));
  return (
    <section className="jb-market__summary jb-measure" data-testid="market-summary">
      <span className="ad-eyebrow">{theme.name}</span>
      <h2>Shopper score: {summary.score}</h2>
      <ul className="jb-market__sold">
        {summary.slots.map((piece, index) =>
          piece === null ? null : (
            <li
              key={piece.id}
              className={soldIds.has(piece.id) ? "jb-market__sale jb-market__sale--sold" : "jb-market__sale"}
            >
              <PiecePreview source={piece.look} title={productById(piece.look.productId).name} />
              <span>
                {soldIds.has(piece.id)
                  ? `Sold for ${summary.sold.find((sale) => sale.pieceId === piece.id)?.coins ?? 0}`
                  : "Back to the stall box"}
              </span>
              <span className="jb-muted">{SLOT_NAMES[index]}</span>
            </li>
          ),
        )}
      </ul>
      {summary.lines.length > 0 ? (
        <ul className="jb-results__lines">
          {summary.lines.map((line) => (
            <li key={line.label}>
              <span>{line.label}</span>
              <strong>+{line.amount}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="jb-results__totals" data-testid="market-totals">
        <span>
          <Icon name="coin" size={20} /> +{summary.coins} coins
        </span>
        <span>
          <Icon name="star" size={20} /> +{summary.reputation} rep
        </span>
        <span>
          <Icon name="megaphone" size={20} /> +{summary.buzz} buzz
        </span>
      </div>
      <p className="jb-muted">Every piece you showed is now in your Keepsake Case.</p>
      <Button size="lg" onClick={onExit} data-testid="market-exit">
        Back to the arcade
      </Button>
    </section>
  );
}

export function MarketDay({ state, dispatch, onExit }: MarketDayProps) {
  const toast = useToast();
  const { reducedMotion } = useSettings();
  const once = useDispatchOnce(state, dispatch);
  const [slots, setSlots] = useState<readonly (string | null)[]>([null, null, null]);
  const [cloth, setCloth] = useState<TrayClothId>("teal");
  const [sign, setSign] = useState(0);
  const theme = themeById(state.marketTheme);
  const shownToday = state.market.shownDay === state.calendar.day ? state.market.last : null;
  const pieces: (StallPiece | null)[] = slots.map(
    (id) => state.stallBox.find((piece) => piece.id === id) ?? null,
  );
  const score = shopperScore(pieces, theme);
  const check = canShowTray(state, { slots, cloth, sign });
  const waiting = state.stallBox.filter((piece) => !slots.includes(piece.id));

  const place = (pieceId: string) => {
    const free = slots.indexOf(null);
    const order = [1, 0, 2];
    const target = order.find((index) => slots[index] === null) ?? free;
    if (target === -1) return;
    setSlots(slots.map((id, index) => (index === target ? pieceId : id)));
  };
  const clear = (index: number) => setSlots(slots.map((id, at) => (at === index ? null : id)));
  const open = (event: { readonly detail: number }) => {
    if (once(event, { type: "showTray", slots, cloth, sign }))
      toast("Shoppers are strolling past your stall!");
  };

  return (
    <main className="jb-market ad-screen" data-testid="market-day">
      <header className="jb-market__head">
        <Button variant="ghost" icon="back" onClick={onExit}>
          Back to the arcade
        </Button>
        <div>
          <span className="ad-eyebrow">Market Day · {theme.name}</span>
          <h1>Your stall tray</h1>
        </div>
        <div
          className="jb-market__theme"
          aria-label={`Theme colours: ${theme.palette.map((id) => jewelColourById(id).name).join(", ")}`}
        >
          {theme.palette.map((colour) => (
            <span
              key={colour}
              className="jb-theme__swatch"
              style={{ background: jewelColourById(colour).hex }}
            />
          ))}
          <strong>{theme.tags.join(" · ")}</strong>
        </div>
      </header>
      <div className="jb-market__stall">
        <StallFront
          decor={state.decor}
          cloth={clothHex(shownToday?.cloth ?? cloth)}
          sign={TRAY_SIGNS[shownToday?.sign ?? sign] ?? ""}
          strolling={!reducedMotion && shownToday !== null}
        />
        <div className="jb-market__tray">
          {TRAY_SLOTS.map((slot, index) => {
            const piece = (shownToday !== null ? shownToday.slots[index] : pieces[index]) ?? null;
            return (
              <button
                key={slot}
                type="button"
                className={piece === null ? "jb-tray-slot jb-tray-slot--empty" : "jb-tray-slot"}
                onClick={() => clear(index)}
                disabled={shownToday !== null || piece === null}
                aria-label={
                  piece === null
                    ? `${SLOT_NAMES[index]} slot, empty`
                    : `${SLOT_NAMES[index]} slot: ${productById(piece.look.productId).name}. Tap to take it off.`
                }
                data-testid={`tray-slot-${slot}`}
              >
                {piece !== null ? (
                  <PiecePreview source={piece.look} title={null} velvet={false} twinkle={!reducedMotion} />
                ) : (
                  <span>{SLOT_NAMES[index]}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {shownToday !== null ? (
        <Summary summary={shownToday} onExit={onExit} />
      ) : (
        <div className="jb-market__controls">
          <section className="jb-design__group">
            <h3>Stall box</h3>
            {waiting.length === 0 ? <p className="jb-muted">Every piece is on the tray.</p> : null}
            <ul className="jb-market__box">
              {waiting.map((piece) => (
                <li key={piece.id}>
                  <button
                    type="button"
                    className="jb-market__piece"
                    onClick={() => place(piece.id)}
                    disabled={!slots.includes(null)}
                    data-testid={`box-${piece.id}`}
                    aria-label={`Put ${productById(piece.look.productId).name}, quality ${piece.quality}, on the tray`}
                  >
                    <PiecePreview source={piece.look} title={null} />
                    <span>
                      <Icon name="star" size={12} /> {piece.quality}
                      {fitsTheme(piece, theme) ? " · fits theme" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="jb-design__group">
            <h3>Tray cloth and sign</h3>
            <SegmentedControl<TrayClothId>
              label="Tray cloth"
              value={cloth}
              onChange={setCloth}
              options={TRAY_CLOTHS.map((option) => ({ value: option.id, label: option.name }))}
            />
            <SegmentedControl<string>
              label="Sign"
              value={String(sign)}
              onChange={(value) => setSign(Number(value))}
              options={TRAY_SIGNS.map((line, index) => ({ value: String(index), label: line }))}
            />
            <div className="jb-market__estimate" aria-live="polite">
              <span>Shoppers will love it this much:</span>
              <strong data-testid="market-estimate">{score.score}</strong>
            </div>
            <p className="jb-hint">Best piece in the centre. Theme tags and colours win shoppers over.</p>
            <Button
              size="lg"
              icon="star"
              onClick={open}
              disabledReason={check.ok ? undefined : check.reasons[0]}
              showReason
              data-testid="show-tray"
            >
              Open the stall · {MARKET_HOURS} h
            </Button>
          </section>
        </div>
      )}
    </main>
  );
}
