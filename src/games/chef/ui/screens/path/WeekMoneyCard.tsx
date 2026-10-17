import { Icon } from "../../../../../ui/kit/IconSet";
import { ledgerMoney, type Ledger } from "../../../core";
import { CoinJar } from "../../art/CoinJar";

export interface WeekMoneyCardProps {
  readonly week: Ledger;
  readonly lastWeek: Ledger | null;
}

function share(part: number, whole: number): string {
  return whole === 0 ? "0%" : `${Math.round((part / whole) * 100)}%`;
}

function MoneyColumn({ title, ledger }: { readonly title: string; readonly ledger: Ledger }) {
  const money = ledgerMoney(ledger);
  const arrow = money.trend === "up" ? "▲" : money.trend === "down" ? "▼" : "■";
  const most = Math.max(money.totalIn, money.totalOut);
  return (
    <div className="ck-money" data-testid="week-money">
      <span className="ad-eyebrow">{title}</span>
      <div className="ck-money__scales" aria-hidden="true">
        <span className="ck-money__bar ck-money__bar--in" style={{ width: share(money.totalIn, most) }}>
          +{money.totalIn}
        </span>
        <span className="ck-money__bar ck-money__bar--out" style={{ width: share(money.totalOut, most) }}>
          −{money.totalOut}
        </span>
      </div>
      <dl className="ck-money__lines">
        <dt className="ck-money__heading ck-money__heading--in">Money in</dt>
        {money.moneyIn.length === 0 ? <dd className="ck-muted">Nothing yet</dd> : null}
        {money.moneyIn.map((line) => (
          <dd key={line.label}>
            <span>{line.label}</span>
            <strong className="ck-good">+{line.amount}</strong>
          </dd>
        ))}
        <dt className="ck-money__heading ck-money__heading--out">Money out</dt>
        {money.moneyOut.length === 0 ? <dd className="ck-muted">Nothing yet</dd> : null}
        {money.moneyOut.map((line) => (
          <dd key={line.label}>
            <span>{line.label}</span>
            <strong className="ck-money__spent">−{line.amount}</strong>
          </dd>
        ))}
      </dl>
      <div className={`ck-money__left ck-money__left--${money.trend}`}>
        <CoinJar fill={money.totalIn === 0 ? 0 : money.leftOver / money.totalIn} className="ck-money__jar" />
        <p>
          <span aria-hidden="true">{arrow}</span> Left over: <Icon name="coin" size={18} /> {money.leftOver}
        </p>
      </div>
      {ledger.unserved > 0 ? (
        <p className="ck-money__unserved">
          <Icon name="sparkle" size={16} />
          <span>
            Ready but not served cost {ledger.unserved} coins. Get ready a little less of the quiet dishes.
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function WeekMoneyCard({ week, lastWeek }: WeekMoneyCardProps) {
  return (
    <section className="ck-panel ck-money-card" aria-labelledby="ck-money-title">
      <header className="ck-panel__header">
        <h2 id="ck-money-title">This week's money</h2>
        <span className="ck-muted">Money in, money out, and what's left over.</span>
      </header>
      <div className="ck-money-card__columns">
        <MoneyColumn title="So far this week" ledger={week} />
        {lastWeek === null ? null : <MoneyColumn title="Last week" ledger={lastWeek} />}
      </div>
    </section>
  );
}
