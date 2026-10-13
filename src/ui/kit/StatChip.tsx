import type { ReactNode } from "react";
import { Icon } from "./IconSet";
import type { IconName } from "./IconSet";

export type StatKind = "coins" | "reputation" | "buzz" | "hours" | "day";

export interface StatChipProps {
  kind: StatKind;
  value: ReactNode;
  label?: string | undefined;
  showLabel?: boolean | undefined;
  className?: string | undefined;
}

const statIcons: Record<StatKind, IconName> = {
  coins: "coin",
  reputation: "star",
  buzz: "megaphone",
  hours: "clock",
  day: "calendar",
};

const statLabels: Record<StatKind, string> = {
  coins: "Coins",
  reputation: "Reputation",
  buzz: "Buzz",
  hours: "Hours left",
  day: "Day",
};

export function StatChip({ kind, value, label, showLabel = false, className }: StatChipProps) {
  const name = label ?? statLabels[kind];
  const classes = ["ad-stat-chip", `ad-stat-chip--${kind}`, className ?? ""]
    .filter((part) => part.length > 0)
    .join(" ");
  return (
    <span className={classes} title={name}>
      <span className="ad-stat-chip__badge">
        <Icon name={statIcons[kind]} size={18} />
      </span>
      {showLabel ? (
        <span className="ad-stat-chip__label">{name}</span>
      ) : (
        <span className="ad-visually-hidden">{name}</span>
      )}
      <span className="ad-stat-chip__value">{value}</span>
    </span>
  );
}
