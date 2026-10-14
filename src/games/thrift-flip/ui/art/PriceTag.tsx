import type { CSSProperties, ReactNode } from "react";

export interface PriceTagProps {
  readonly tilt?: number | undefined;
  readonly tone?: "kraft" | "cream" | "mint" | "tangerine" | undefined;
  readonly className?: string | undefined;
  readonly children?: ReactNode;
}

export function PriceTag({ tilt = 0, tone = "kraft", className, children }: PriceTagProps) {
  const style = { "--tf-tilt": `${tilt}deg` } as CSSProperties;
  const classes = ["tf-tag", `tf-tag--${tone}`, className ?? ""].filter((name) => name.length > 0).join(" ");
  return (
    <div className={classes} style={style}>
      <svg className="tf-tag__twine" viewBox="0 0 40 60" aria-hidden="true" focusable="false">
        <path
          d="M30 58 C 10 44, 34 26, 14 4"
          fill="none"
          stroke="#a07a52"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <path
          d="M30 58 C 18 46, 40 28, 22 2"
          fill="none"
          stroke="#c99f72"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </svg>
      <span className="tf-tag__hole" aria-hidden="true" />
      <div className="tf-tag__body">{children}</div>
    </div>
  );
}
