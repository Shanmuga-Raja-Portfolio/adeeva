import { FabricSwatch } from "../../../../adeeva/ui/art/FabricSwatch";
import { TrimBadge } from "../../../../adeeva/ui/art/TrimArt";
import { TRIM_IDS } from "../../../../adeeva/content/trim";
import { Card } from "../../../../../ui/kit/Card";
import { conditionById, findById, trimById, type GameState } from "../../../core";
import { FindArt } from "../../art/FindArt";

export interface StockPanelProps {
  readonly state: GameState;
}

export function StockPanel({ state }: StockPanelProps) {
  const { finds, savedTrims, scraps } = state.stock;
  const trims = TRIM_IDS.filter((id) => savedTrims[id] > 0);
  return (
    <Card title="Stockroom" eyebrow="Ready for new flips" className="tf-hub-card tf-stock">
      <section aria-label="Finds in stock">
        <h4 className="tf-stock__heading">Finds</h4>
        {finds.length === 0 ? (
          <p className="ad-muted tf-stock__empty">No finds waiting. The rail has new ones each day.</p>
        ) : (
          <ul className="tf-stock__finds">
            {finds.map((owned) => {
              const find = findById(owned.findId);
              return (
                <li key={owned.id}>
                  <FindArt find={find} grade={owned.grade} size={52} />
                  <span>
                    {find.name}
                    <small>{conditionById(owned.grade).name}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section aria-label="Saved buttons and bows">
        <h4 className="tf-stock__heading">Saved buttons & bows</h4>
        {trims.length === 0 ? (
          <p className="ad-muted tf-stock__empty">Snip stitches gently to save them.</p>
        ) : (
          <ul className="tf-stock__trims">
            {trims.map((id) => (
              <li key={id} title={trimById(id).name}>
                <TrimBadge trimId={id} size={36} />
                <span>× {savedTrims[id]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label="Scraps">
        <h4 className="tf-stock__heading">Scraps ({scraps.length}/12)</h4>
        <ul className="tf-stock__scraps">
          {scraps.map((scrap) => (
            <li key={scrap.id} title={scrap.name}>
              <FabricSwatch fabric={scrap} size={34} decorative />
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}
