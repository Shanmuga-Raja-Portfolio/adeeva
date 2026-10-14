import { Card } from "../../../../../ui/kit/Card";
import { CHAIN_IDS, CHARM_IDS, CLIP_SET } from "../../../content/extra";
import { METAL_IDS } from "../../../content/metal";
import { STOCK_SIZE_IDS } from "../../../content/stockSize";
import { STONE_IDS } from "../../../content/stone";
import { extraById, metalById, stockSizeById, stoneById, type GameState } from "../../../core";
import { MiniIcon } from "../../art/MiniIcon";

interface StockDrawersProps {
  readonly state: GameState;
}

export function StockDrawers({ state }: StockDrawersProps) {
  const { stock } = state;
  const metals = METAL_IDS.flatMap((metalId) =>
    STOCK_SIZE_IDS.filter((size) => stock.metal[metalId][size] > 0).map(
      (size) =>
        `${stock.metal[metalId][size]} × ${metalById(metalId).name} ${stockSizeById(size).name.toLowerCase()}`,
    ),
  );
  const stones = STONE_IDS.filter((id) => stock.stones[id] > 0).map(
    (id) => `${stock.stones[id]} × ${stoneById(id).name}`,
  );
  const extras = [...CHAIN_IDS, ...CHARM_IDS]
    .filter((id) => stock.extras[id] > 0)
    .map((id) => `${stock.extras[id]} × ${extraById(id).name}`);
  const clips = stock.clips > 0 ? [`${stock.clips} × ${CLIP_SET.name}`] : [];
  const empty = metals.length + stones.length + extras.length + clips.length === 0;
  return (
    <Card title="Stock drawers" eyebrow="What's in your bench" className="jb-hub-card">
      {empty ? (
        <p className="jb-muted">Empty for now. The Supply Cabinet opens when you start a piece.</p>
      ) : (
        <ul className="jb-stock">
          {metals.length > 0 ? (
            <li>
              <MiniIcon name="sheet" /> {metals.join(", ")}
            </li>
          ) : null}
          {stones.length > 0 ? (
            <li>
              <MiniIcon name="gem" /> {stones.join(", ")}
            </li>
          ) : null}
          {[...extras, ...clips].length > 0 ? (
            <li>
              <MiniIcon name="glint" /> {[...extras, ...clips].join(", ")}
            </li>
          ) : null}
        </ul>
      )}
    </Card>
  );
}
