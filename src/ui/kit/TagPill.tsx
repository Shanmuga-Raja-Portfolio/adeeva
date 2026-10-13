import type { ReactNode } from "react";
import "./TagPill.css";

export type TagPillTone = "plain" | "hot" | "next" | "sage" | "gold" | "danger";

export interface TagPillProps {
  tone?: TagPillTone | undefined;
  children?: ReactNode;
}

export function TagPill({ tone = "plain", children }: TagPillProps) {
  return (
    <span className={tone === "plain" ? "ad-pill-tag" : `ad-pill-tag ad-pill-tag--${tone}`}>{children}</span>
  );
}
