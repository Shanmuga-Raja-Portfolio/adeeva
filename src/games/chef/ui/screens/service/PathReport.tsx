import { Icon } from "../../../../../ui/kit/IconSet";
import {
  criticById,
  dishById,
  festivalById,
  type GameState,
  type SalePlan,
  type ServiceLogEntry,
} from "../../../core";
import { SpoonRating } from "../path/SpoonRating";
import "../path/path.css";

function SalesTable({ plan }: { readonly plan: SalePlan }) {
  return (
    <table className="ck-sales">
      <thead>
        <tr>
          <th scope="col">Dish</th>
          <th scope="col">Wanted</th>
          <th scope="col">Ready</th>
          <th scope="col">Sold</th>
          <th scope="col">Not served</th>
        </tr>
      </thead>
      <tbody>
        {plan.dishes.map((dish) => (
          <tr key={dish.dishId}>
            <th scope="row">{dishById(dish.dishId).name}</th>
            <td>{dish.wanted}</td>
            <td>{dish.stock}</td>
            <td className="ck-good">{dish.sold}</td>
            <td>{dish.leftover}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Money({ lines }: { readonly lines: readonly (readonly [string, number])[] }) {
  return (
    <ul className="ck-results__lines">
      {lines
        .filter(([, amount]) => amount !== 0)
        .map(([label, amount]) => (
          <li key={label}>
            <span>{label}</span>
            <strong>
              {amount >= 0 ? "+" : ""}
              {amount}
            </strong>
          </li>
        ))}
    </ul>
  );
}

export function pathCoins(state: GameState, entry: ServiceLogEntry): number {
  const path = state.path;
  if (entry.service === "night" && path?.kind === "restaurant" && path.lastNight !== null)
    return (
      path.lastNight.plateCoins +
      path.lastNight.tips -
      path.lastNight.teamPay -
      path.lastNight.plan.ingredients
    );
  if (entry.service === "festival" && path?.kind === "truck" && path.lastFestival !== null) {
    const report = path.lastFestival;
    return report.plateCoins - report.pitch - report.helperFee - report.plan.ingredients;
  }
  return 0;
}

export function PathReport({ state, entry }: { readonly state: GameState; readonly entry: ServiceLogEntry }) {
  const path = state.path;
  if (path === null) return null;
  if (entry.service === "night" && path.kind === "restaurant" && path.lastNight !== null) {
    const report = path.lastNight;
    return (
      <section className="ck-path-report" data-testid="night-report">
        <p className="ck-path-report__lead">
          <Icon name="heart" size={18} /> {report.plan.guests} guests came in.
          {report.plan.keptSimple > 0
            ? ` ${report.plan.keptSimple} plates' worth of guests kept it simple tonight.`
            : ""}
        </p>
        <SalesTable plan={report.plan} />
        <Money
          lines={[
            ["Plates sold", report.plateCoins],
            ["Happy guests' tips", report.tips],
            ["Team pay", -report.teamPay],
            ["Market Run (paid before opening)", -report.plan.ingredients],
          ]}
        />
        {report.carried.length > 0 ? (
          <p className="ck-muted">The Walk-in Fridge kept half of the unserved portions for next time.</p>
        ) : (
          <p className="ck-muted">Ready but not served went to the Larkspur Community Fridge.</p>
        )}
        {report.review === null ? null : (
          <div className="ck-path-report__review">
            <span className="ad-eyebrow">The guest at Table 7 was a critic!</span>
            <strong>
              {criticById(report.review.criticId).name}, {criticById(report.review.criticId).outlet}
            </strong>
            <SpoonRating spoons={report.review.spoons} />
            {report.review.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}
        <ul className="ck-notes">
          {report.notes.map((note) => (
            <li key={note} className="ck-note">
              {note}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (entry.service === "festival" && path.kind === "truck" && path.lastFestival !== null) {
    const report = path.lastFestival;
    const festival = festivalById(report.festivalId);
    return (
      <section className="ck-path-report" data-testid="festival-report">
        <p className="ck-path-report__lead">
          <Icon name="heart" size={18} /> {report.plan.guests} festival guests at {festival.name}.
        </p>
        {report.ribbon ? (
          <p className="ck-path-report__ribbon" data-testid="festival-ribbon">
            <span className="ck-ribbon" aria-hidden="true" /> Festival Favourite ribbon for Clementine's
            hatch!
          </p>
        ) : (
          <p className="ck-muted">A ribbon needs a score of 85. Next festival!</p>
        )}
        <SalesTable plan={report.plan} />
        <Money
          lines={[
            ["Plates sold", report.plateCoins],
            ["Pitch fee (paid this morning)", -report.pitch],
            ["Helper (paid this morning)", -report.helperFee],
            ["Market Run (paid this morning)", -report.plan.ingredients],
          ]}
        />
      </section>
    );
  }
  if (entry.service === "launch" && path.kind === "tv") {
    return (
      <section className="ck-path-report" data-testid="launch-report">
        <p className="ck-path-report__ribbon">
          <Icon name="star" size={20} /> The Golden Page: your book is on the Larkspur Library shelf!
        </p>
        <p className="ck-muted">Every tasting cup went to a young cook and their grown-up.</p>
      </section>
    );
  }
  return null;
}
