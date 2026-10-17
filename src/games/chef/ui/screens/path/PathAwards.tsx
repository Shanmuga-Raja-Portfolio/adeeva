import { Icon } from "../../../../../ui/kit/IconSet";
import { PATH_AWARDS } from "../../../content/award";
import { awardById, type PathState } from "../../../core";

export interface PathAwardsProps {
  readonly path: PathState;
  readonly className?: string | undefined;
}

export function PathAwards({ path, className }: PathAwardsProps) {
  return (
    <div className={className === undefined ? "ck-path-awards" : `ck-path-awards ${className}`}>
      <span className="ck-path-awards__label">Awards to win</span>
      <ul aria-label="Path awards">
        {PATH_AWARDS[path.kind].map((id) => {
          const won = path.awards.includes(id);
          return (
            <li key={id} className={won ? "ck-path-award ck-path-award--won" : "ck-path-award"}>
              <span className="ck-path-award__medal" aria-hidden="true">
                <Icon name="star" size={16} />
              </span>
              {awardById(id).name}
              {won ? <span className="ad-visually-hidden"> (won)</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
