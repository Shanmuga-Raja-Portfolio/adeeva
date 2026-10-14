import { Card } from "../../../../../ui/kit/Card";
import { DECOR } from "../../../content/decor";
import { FLOORS } from "../../../content/floor";
import { FURNITURE } from "../../../content/furniture";
import { LIGHTS } from "../../../content/light";
import { PAINTS } from "../../../content/paint";
import type { GameState } from "../../../core";

interface LeftoverShelfProps {
  readonly state: GameState;
}

export function LeftoverShelf({ state }: LeftoverShelfProps) {
  const { stock } = state;
  const rows = [
    ...FURNITURE.map((item) => ({ id: item.id, name: item.name, count: stock.furniture[item.id] })),
    ...PAINTS.map((item) => ({ id: item.id, name: `${item.name} tin`, count: stock.paints[item.id] })),
    ...FLOORS.map((item) => ({ id: item.id, name: `${item.name} pack`, count: stock.floors[item.id] })),
    ...LIGHTS.map((item) => ({ id: item.id, name: item.name, count: stock.lights[item.id] })),
    ...DECOR.map((item) => ({ id: item.id, name: item.name, count: stock.decor[item.id] })),
  ].filter((row) => row.count > 0);
  return (
    <Card
      title="Leftover shelf"
      eyebrow="Used before buying more"
      className="is-hub-card"
      data-testid="leftover-shelf"
    >
      {rows.length === 0 ? (
        <p className="is-muted">Spare tins and pieces wait here for the next room.</p>
      ) : (
        <ul className="is-shelf">
          {rows.map((row) => (
            <li key={row.id} className="is-shelf__item">
              <span>{row.name}</span>
              <strong>× {row.count}</strong>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
