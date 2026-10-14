import { Icon } from "../../../../../../ui/kit/IconSet";

export interface FitsBadgeProps {
  readonly fits: boolean;
  readonly twoFinds?: boolean | undefined;
}

export function FitsBadge({ fits, twoFinds = false }: FitsBadgeProps) {
  if (twoFinds)
    return (
      <span className="tf-fits tf-fits--two" data-fits="two">
        <Icon name="sparkle" size={14} />
        Use with a second find
      </span>
    );
  return (
    <span className={fits ? "tf-fits tf-fits--yes" : "tf-fits tf-fits--no"} data-fits={fits ? "yes" : "no"}>
      {fits ? <Icon name="check" size={14} /> : <Icon name="close" size={14} />}
      {fits ? "Fits" : "Won't fit"}
    </span>
  );
}
