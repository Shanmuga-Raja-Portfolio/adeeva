import { useState } from "react";
import type { ColourId } from "../../../../../engine/palette";
import { colourById } from "../../../../../engine/palette";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { DECORS, type DecorId } from "../../../content/decor";
import { PAINT_COLOURS } from "../../../content/finish";
import { decorIssues, type GameState } from "../../../core";

interface DecorPanelProps {
  readonly state: GameState;
  readonly onBuy: (event: ClickLike, decorId: DecorId, paint: ColourId | null) => void;
}

export function DecorPanel({ state, onBuy }: DecorPanelProps) {
  const [paint, setPaint] = useState<ColourId>("teal");
  return (
    <Card title="Garage decor" eyebrow="Just for looks" className="ww-hub-card">
      <ul className="ww-shop">
        {DECORS.map((decor) => {
          const owned = state.decor.some((entry) => entry.id === decor.id);
          const choice = decor.takesPaint ? paint : null;
          const issue = decorIssues(state, decor.id, choice)[0];
          return (
            <li key={decor.id} className={owned ? "ww-shop__item ww-shop__item--owned" : "ww-shop__item"}>
              <div>
                <strong>{decor.name}</strong>
                <p className="ww-muted">{decor.description}</p>
                {decor.takesPaint && !owned ? (
                  <div className="ww-paints" role="radiogroup" aria-label="Door colour">
                    {PAINT_COLOURS.map((colour) => (
                      <button
                        key={colour}
                        type="button"
                        role="radio"
                        aria-checked={colour === paint}
                        aria-label={colourById(colour).name}
                        className="ww-paints__swatch"
                        style={{ background: colourById(colour).hex }}
                        onClick={() => setPaint(colour)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              {owned ? (
                <span className="ww-shop__owned">
                  <Icon name="check" size={16} /> Up
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(event) => onBuy(event, decor.id, choice)}
                  disabledReason={issue}
                  aria-label={`Buy ${decor.name} for ${decor.price} coins`}
                >
                  <Icon name="coin" size={14} /> {decor.price}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
