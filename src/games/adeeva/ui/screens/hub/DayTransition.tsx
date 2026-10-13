import type { ReactNode } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon, type IconName } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { DaySummary } from "./daySummary";
import { weekdayName } from "./weekday";
import "./dayTransition.css";

export interface DayTransitionProps {
  summary: DaySummary;
  onDone: () => void;
}

interface SummaryLine {
  readonly key: string;
  readonly icon: IconName;
  readonly content: ReactNode;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function summaryLines(summary: DaySummary): SummaryLine[] {
  const lines: SummaryLine[] = [];
  if (summary.kind === "shift")
    lines.push({
      key: "shift",
      icon: "bag",
      content: `You worked a shift and earned ${summary.shiftPay} coins.`,
    });
  if (summary.bill !== null) {
    const total = summary.bill.rent + summary.bill.wage;
    lines.push({
      key: "bill",
      icon: "coin",
      content:
        total === 0
          ? "A new week begins. No bills to pay."
          : `Weekly bills paid: ${summary.bill.rent} rent${summary.bill.wage > 0 ? ` and ${summary.bill.wage} wages` : ""}.`,
    });
  }
  if (summary.newOffers.length > 0)
    lines.push({
      key: "offers",
      icon: "heart",
      content: `${plural(summary.newOffers.length, "new request")} in your inbox from ${summary.newOffers.join(", ")}.`,
    });
  if (summary.expiredOffers > 0)
    lines.push({
      key: "expired",
      icon: "clock",
      content: `${plural(summary.expiredOffers, "request")} went to someone else while you were busy.`,
    });
  if (summary.lapsedGigs.length > 0)
    lines.push({
      key: "lapsed",
      icon: "close",
      content: `${summary.lapsedGigs.join(", ")} stopped waiting for an overdue dress.`,
    });
  if (summary.trendsChanged)
    lines.push({
      key: "trends",
      icon: "sparkle",
      content: (
        <>
          Trends shifted. Everyone wants{" "}
          {summary.trends.map((tag) => (
            <TagPill key={tag} tone="hot">
              {tag}
            </TagPill>
          ))}
        </>
      ),
    });
  if (lines.length === 0)
    lines.push({
      key: "quiet",
      icon: "needle",
      content: "A quiet night. The studio is tidy and ready for you.",
    });
  return lines;
}

export function DayTransition({ summary, onDone }: DayTransitionProps) {
  const lines = summaryLines(summary);
  const coins = summary.coinsDelta;
  return (
    <div className="ad-dawn" role="dialog" aria-modal="true" aria-labelledby="ad-dawn-title">
      <div className="ad-dawn__sky" aria-hidden="true">
        <span className="ad-dawn__moon" />
        <span className="ad-dawn__sun" />
        {[12, 26, 44, 63, 78, 88].map((left, index) => (
          <span
            key={left}
            className="ad-dawn__star"
            style={{
              left: `${left}%`,
              top: `${10 + ((index * 17) % 30)}%`,
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </div>
      <section className="ad-dawn__card">
        <span className="ad-eyebrow">Good morning</span>
        <h2 id="ad-dawn-title" className="ad-dawn__title">
          Day {summary.toDay}
          <span className="ad-dawn__weekday">{weekdayName(summary.toDay)}</span>
        </h2>
        <ul className="ad-dawn__lines">
          {lines.map((line, index) => (
            <li key={line.key} className="ad-dawn__line" style={{ animationDelay: `${900 + index * 160}ms` }}>
              <span className="ad-dawn__icon">
                <Icon name={line.icon} size={18} />
              </span>
              <span>{line.content}</span>
            </li>
          ))}
        </ul>
        {coins !== 0 || summary.reputationDelta !== 0 ? (
          <p className="ad-dawn__ledger">
            {coins !== 0 ? (
              <span className={coins > 0 ? "ad-dawn__up" : "ad-dawn__down"}>
                <Icon name="coin" size={16} /> {coins > 0 ? `+${coins}` : coins} coins
              </span>
            ) : null}
            {summary.reputationDelta !== 0 ? (
              <span className={summary.reputationDelta > 0 ? "ad-dawn__up" : "ad-dawn__down"}>
                <Icon name="star" size={16} /> {summary.reputationDelta > 0 ? "+" : ""}
                {summary.reputationDelta} reputation
              </span>
            ) : null}
          </p>
        ) : null}
        <Button size="lg" autoFocus onClick={onDone}>
          Start the day
        </Button>
      </section>
    </div>
  );
}
