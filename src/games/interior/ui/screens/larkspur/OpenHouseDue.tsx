import { Icon } from "../../../../../ui/kit/IconSet";
import "./larkspur.css";
import { openHouseAlert, openHouseDay, type Project } from "../../../core";

export function OpenHouseDue({ project, day }: { readonly project: Project; readonly day: number }) {
  const alert = openHouseAlert(project, day);
  const daysLeft = openHouseDay(project) - day;
  if (alert === "today")
    return (
      <strong className="is-due is-due--today" data-testid="open-house-due">
        <Icon name="star" size={16} /> Open House is today!
      </strong>
    );
  if (alert === "late")
    return (
      <strong className="is-due is-due--today" data-testid="open-house-due">
        <Icon name="star" size={16} /> Last day to open the doors!
      </strong>
    );
  return (
    <span className="is-due" data-testid="open-house-due">
      <Icon name="calendar" size={16} /> Open House day {openHouseDay(project)}
      {daysLeft > 0 ? ` (in ${daysLeft} ${daysLeft === 1 ? "day" : "days"})` : ""}
    </span>
  );
}
