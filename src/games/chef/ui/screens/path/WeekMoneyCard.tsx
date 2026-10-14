import { Icon } from "../../../../../ui/kit/IconSet";
import { ledgerMoney, type Ledger } from "../../../core";

export interface WeekMoneyCardProps {
  readonly week: Ledger;
  readonly lastWeek: Ledger | null;
}

function MoneyColumn({ title, ledger }: { readonly title: string; readonly ledger: Ledger }) {
  const money = ledgerMoney(ledger);
  const arrow = money.trend === "up" ? "▲" : money.trend === "down" ? "▼" : "■";
  return (
    <div className="ck-money" data-testid="week-money">
      <span className="ad-eyebrow">{title}</span>
      <dl className="ck-money__lines">
        <dt className="ck-money__heading">Money in</dt>
        {money.moneyIn.length === 0 ? <dd className="ck-muted">Nothing yet</dd> : null}
        {money.moneyIn.map((line) => (
          <dd key={line.label}>
            <span>{line.label}</span>
            <strong className="ck-good">+{line.amount}</strong>
          </dd>
        ))}
        <dt className="ck-money__heading">Money out</dt>
        {money.moneyOut.length === 0 ? <dd className="ck-muted">Nothing yet</dd> : null}
        {money.moneyOut.map((line) => (
          <dd key={line.label}>
            <span>{line.label}</span>
            <strong>−{line.amount}</strong>
          </dd>
        ))}
      </dl>
      <p className={`ck-money__left ck-money__left--${money.trend}`}>
        <span aria-hidden="true">{arrow}</span> Left over: <Icon name="coin" size={16} /> {money.leftOver}
      </p>
      {ledger.unserved > 0 ? (
        <p className="ck-money__unserved">
          Ready but not served cost {ledger.unserved} coins. Get ready a little less of the quiet dishes.
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
