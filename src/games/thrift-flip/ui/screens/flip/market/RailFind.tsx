import type { CSSProperties } from "react";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { conditionById, findById, type RailSlot } from "../../../../core";
import { FindArt } from "../../../art/FindArt";
import { FitsBadge } from "./FitsBadge";

export interface RailFindProps {
  readonly slot: RailSlot;
  readonly fits: boolean;
  readonly twoFinds: boolean;
  readonly hot: boolean;
  readonly picked: boolean;
  readonly open: boolean;
  readonly index: number;
  readonly onToggle: () => void;
  readonly onCloseUp: () => void;
}

export function RailFind({
  slot,
  fits,
  twoFinds,
  hot,
  picked,
  open,
  index,
  onToggle,
  onCloseUp,
}: RailFindProps) {
  const find = findById(slot.findId);
  const condition = conditionById(slot.grade);
  return (
    <li
      className={["tf-rail-find", picked ? "tf-rail-find--picked" : "", slot.sold ? "tf-rail-find--sold" : ""]
        .filter((name) => name.length > 0)
        .join(" ")}
      style={{ "--tf-delay": `${index * 0.35}s` } as CSSProperties}
      data-rail-find={slot.findId}
      data-fits={fits ? "yes" : "no"}
    >
      <button
        type="button"
        className="tf-rail-find__art"
        onClick={onCloseUp}
        aria-label={`Look closer at the ${find.name}`}
      >
        <FindArt find={find} grade={slot.grade} size={112} />
        <span className={`tf-ribbon tf-ribbon--${slot.grade}`}>{condition.name}</span>
        {hot ? (
          <span className="tf-hot">
            <Icon name="megaphone" size={12} /> Hot
          </span>
        ) : null}
      </button>
      <div className="tf-rail-find__tag">
        <strong className="tf-rail-find__name">{find.name}</strong>
        <span className="tf-rail-find__story">{find.backstory}</span>
        <span className="tf-rail-find__row">
          <span className="tf-rail-find__price">
            <Icon name="coin" size={14} /> {slot.price}
          </span>
          <FitsBadge fits={fits} twoFinds={twoFinds} />
        </span>
        {slot.sold ? (
          <span className="tf-rail-find__sold">Taken home</span>
        ) : open ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={picked}
            className="tf-rail-find__pick"
            onClick={onToggle}
            aria-label={`${picked ? "Unpick" : "Pick"} the ${find.name}`}
          >
            <span className="tf-rail-find__box" aria-hidden="true">
              {picked ? <Icon name="check" size={16} /> : null}
            </span>
            {picked ? "Picked" : "Pick"}
          </button>
        ) : null}
      </div>
    </li>
  );
}
