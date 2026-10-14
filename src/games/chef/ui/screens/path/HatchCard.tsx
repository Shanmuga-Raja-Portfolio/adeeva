import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { PATH_RULES } from "../../../content/career";
import { menuPortions, dishById, type TruckState } from "../../../core";

export interface HatchCardProps {
  readonly truck: TruckState;
  readonly onMenu: () => void;
  readonly onReady: () => void;
}

export function HatchCard({ truck, onMenu, onReady }: HatchCardProps) {
  const total = menuPortions(truck.menu);
  return (
    <section className="ck-panel ck-hatch" aria-labelledby="ck-hatch-title" data-testid="hatch-card">
      <header className="ck-panel__header">
        <h2 id="ck-hatch-title">Clementine's kitchen</h2>
        <span className="ck-muted">Three dishes and one fridge</span>
      </header>
      {truck.menu.length === 0 ? (
        <p className="ck-muted">Pick three dishes for the hatch.</p>
      ) : (
        <ul className="ck-menu-list">
          {truck.menu.map((entry) => (
            <li key={entry.dishId} className="ck-chalk ck-hatch__dish">
              {dishById(entry.dishId).name}
              <span>
                <Icon name="coin" size={14} /> {entry.price} · {entry.par} ready
              </span>
            </li>
          ))}
        </ul>
      )}
      <Meter
        value={total}
        max={PATH_RULES.fridge}
        tone="gold"
        showValue={false}
        label={`Fridge: ${total} of ${PATH_RULES.fridge}`}
      />
      <div className="ck-tonight__desks">
        <Button variant="secondary" icon="palette" onClick={onMenu} data-testid="open-menu">
          Menu &amp; prices
        </Button>
        <Button variant="secondary" icon="bag" onClick={onReady} data-testid="open-ready">
          Fill the fridge
        </Button>
      </div>
    </section>
  );
}
