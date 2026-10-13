import type { HTMLAttributes, ReactNode } from "react";

export type CardTone = "paper" | "rose" | "sage" | "gold";
export type CardVariant = "card" | "panel";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  as?: "section" | "article" | "div" | "aside" | undefined;
  variant?: CardVariant | undefined;
  tone?: CardTone | undefined;
  title?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  interactive?: boolean | undefined;
  children?: ReactNode;
}

export function Card({
  as = "section",
  variant = "card",
  tone = "paper",
  title,
  eyebrow,
  actions,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const Element = as;
  const classes = [
    "ad-card",
    variant === "panel" ? "ad-card--panel" : "",
    tone === "paper" ? "" : `ad-card--${tone}`,
    interactive ? "ad-card--interactive" : "",
    className ?? "",
  ]
    .filter((name) => name.length > 0)
    .join(" ");
  const hasHeader = title !== undefined || eyebrow !== undefined || actions !== undefined;
  return (
    <Element {...rest} className={classes}>
      {hasHeader ? (
        <header className="ad-card__header">
          <div>
            {eyebrow !== undefined ? <span className="ad-eyebrow ad-card__eyebrow">{eyebrow}</span> : null}
            {title !== undefined ? <h3 className="ad-card__title">{title}</h3> : null}
          </div>
          {actions !== undefined ? <div className="ad-card__actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </Element>
  );
}
