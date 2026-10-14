import { Icon } from "../../../../../../ui/kit/IconSet";

export interface FitsBadgeProps {
  readonly fits: boolean;
}

export function FitsBadge({ fits }: FitsBadgeProps) {
  return (
    <span className={fits ? "tf-fits tf-fits--yes" : "tf-fits tf-fits--no"} data-fits={fits ? "yes" : "no"}>
      {fits ? <Icon name="check" size={14} /> : <Icon name="close" size={14} />}
      {fits ? "Fits" : "Won't fit"}
    </span>
  );
}
