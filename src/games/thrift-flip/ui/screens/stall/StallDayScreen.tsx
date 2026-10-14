import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { HINTS } from "../../../content/hint";
import {
  fairBand,
  recipeById,
  stallHeldToday,
  stallIssues,
  type Action,
  type GameState,
  type SaleOutcome,
} from "../../../core";
import { Awning } from "../../art/Awning";
import { pieceCloth } from "../../art/findCloth";
import { ProductPreview } from "../../art/ProductPreview";
import { Shoppers } from "../../art/Shoppers";
import { StallBackdrop } from "../../art/StallBackdrop";
import { PriceTagEditor, sliderMax } from "./PriceTagEditor";
import "./stall.css";

export interface StallDayScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const OUTCOME_TEXT: Readonly<Record<SaleOutcome, string>> = {
  bargain: "A bargain!",
  sold: "Sold",
  fair: "Fair Price",
  stayed: "Stays for next week",
};

export function StallDayScreen({ state, dispatch, onExit }: StallDayScreenProps) {
  const once = useDispatchOnce(state, dispatch);
  const bands = Object.fromEntries(
    state.rack.map((piece) => [piece.id, fairBand(piece, state.trends.current)]),
  );
  const [prices, setPrices] = useState<Readonly<Record<string, number>>>(() =>
    Object.fromEntries(
      state.rack.map((piece) => {
        const band = bands[piece.id];
        return [piece.id, band === undefined ? 10 : Math.min(sliderMax(band), Math.round(band.value * 1.25))];
      }),
    ),
  );
  const [hung] = useState(() => state.rack);
  const held = stallHeldToday(state);
  const result = held ? state.stall : null;
  const issue = stallIssues(state, prices)[0];

  return (
    <main className="tf-stall ad-screen" data-testid="stall-day">
      <StallBackdrop className="tf-stall__backdrop" />
      <div className="tf-stall__veil" aria-hidden="true" />
      <Awning className="tf-stall__awning" />
      <div className="tf-stall__content">
        <header className="tf-stall__head">
          <Button variant="secondary" icon="back" onClick={onExit}>
            Back to the stall
          </Button>
          <div>
            <span className="ad-eyebrow">Day {state.calendar.day}</span>
            <h1>{held ? "Stall Day is done!" : "Stall Day"}</h1>
          </div>
          <div className="tf-stall__crowd">
            <span className="ad-eyebrow">Crowd loves</span>
            {state.trends.current.map((tag) => (
              <TagPill key={tag} tone="hot">
                {tag}
              </TagPill>
            ))}
          </div>
        </header>
        {result !== null ? (
          <section className="tf-stall__result" aria-live="polite" data-testid="stall-result">
            <ul className="tf-stall__sales">
              {result.sales.map((sale, index) => {
                const sold = hung.find((entry) => entry.id === sale.pieceId);
                return (
                  <li
                    key={sale.pieceId}
                    className={`tf-sale tf-sale--${sale.outcome}`}
                    style={{ animationDelay: `${index * 180}ms` }}
                  >
                    {sold !== undefined ? (
                      <ProductPreview
                        design={sold.design}
                        cloth={pieceCloth(sold.id, sold.cloth)}
                        finishes={sold.finishes}
                        title={recipeById(sale.recipeId).name}
                        className="tf-sale__art"
                      />
                    ) : null}
                    <strong>{recipeById(sale.recipeId).name}</strong>
                    <span>
                      <Icon name="coin" size={14} /> {sale.price}
                    </span>
                    <span className="tf-sale__badge">{OUTCOME_TEXT[sale.outcome]}</span>
                  </li>
                );
              })}
            </ul>
            {result.sales.length === 0 ? (
              <p>The rack was empty this week. Make pieces for next Stall Day!</p>
            ) : null}
            <div className="tf-stall__totals">
              <span>
                <Icon name="coin" size={20} /> +{result.coins}
              </span>
              <span>
                <Icon name="star" size={20} /> +{result.reputation}
              </span>
              <span>
                <Icon name="megaphone" size={20} /> +{result.buzz}
              </span>
            </div>
            <Shoppers busy={false} />
            <Button size="lg" onClick={onExit} data-testid="stall-done">
              Back to the stall
            </Button>
          </section>
        ) : (
          <section className="tf-stall__rack" aria-label="Your rack">
            <p className="tf-hint">
              <Icon name="coin" size={18} />
              {HINTS.price}
            </p>
            {state.rack.length === 0 ? (
              <p className="tf-stall__empty">
                No pieces on the rack yet. You can still open the awning and say hello.
              </p>
            ) : (
              <div className="tf-stall__pieces">
                {state.rack.map((piece, index) => {
                  const band = bands[piece.id];
                  return band === undefined ? null : (
                    <PriceTagEditor
                      key={piece.id}
                      piece={piece}
                      band={band}
                      tilt={index % 2 === 0 ? -2 : 2}
                      price={prices[piece.id] ?? band.value}
                      onPrice={(price) => setPrices((current) => ({ ...current, [piece.id]: price }))}
                    />
                  );
                })}
              </div>
            )}
            <Shoppers busy />
            <Button
              size="lg"
              icon="bag"
              onClick={(event) => once(event, { type: "holdStall", prices })}
              disabledReason={issue}
              data-testid="hold-stall"
            >
              Open the awning
            </Button>
          </section>
        )}
      </div>
    </main>
  );
}
