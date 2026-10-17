import type { ReactNode } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";

export interface PlateCheck {
  readonly key: string;
  readonly ok: boolean;
  readonly label: string;
}

export interface PlateChecksProps {
  readonly checks: readonly PlateCheck[];
  readonly children?: ReactNode;
}

export function PlateChecks({ checks, children }: PlateChecksProps) {
  return (
    <div className="ck-plate__card">
      <span className="ck-plate__card-title">A good plate</span>
      <ul className="ck-plate__checks">
        {checks.map((check) => (
          <li
            key={check.key}
            className={check.ok ? "ck-plate__check ck-plate__check--ok" : "ck-plate__check"}
          >
            <span className="ck-plate__check-mark" aria-hidden="true">
              {check.ok ? <Icon name="check" size={16} /> : null}
            </span>
            {check.label}
            <span className="ad-visually-hidden">{check.ok ? ", done" : ", not yet"}</span>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}
