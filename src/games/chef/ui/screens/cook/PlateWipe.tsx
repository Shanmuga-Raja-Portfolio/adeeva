import { Icon } from "../../../../../ui/kit/IconSet";

export interface PlateWipeProps {
  readonly wiped: boolean;
  readonly onWipe: () => void;
}

export function PlateWipe({ wiped, onWipe }: PlateWipeProps) {
  return (
    <button
      type="button"
      className={wiped ? "ck-plate__wipe ck-plate__wipe--done" : "ck-plate__wipe"}
      onClick={onWipe}
      disabled={wiped}
      data-testid="wipe-rim"
    >
      <span className="ck-plate__wipe-cloth" aria-hidden="true">
        {wiped ? <Icon name="check" size={22} /> : <Icon name="sparkle" size={22} />}
      </span>
      {wiped ? "Rim wiped" : "Wipe rim"}
    </button>
  );
}
