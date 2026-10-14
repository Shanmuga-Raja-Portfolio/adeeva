import { weekdayName } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import {
  hireIssue,
  SERVICE_NIGHTS,
  shiftIssue,
  staffById,
  teamStaff,
  nightsWithoutCook,
  type Action,
  type GameState,
  type RestaurantState,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { HollisButton } from "./HollisButton";
import { staffRoleLine } from "./staffRole";

export interface TeamDialogProps {
  readonly state: GameState;
  readonly restaurant: RestaurantState;
  readonly open: boolean;
  readonly dispatch: (action: Action) => boolean;
  readonly onClose: () => void;
}

function nightLabel(night: number): string {
  return weekdayName(night).slice(0, 3);
}

export function TeamDialog({ state, restaurant, open, dispatch, onClose }: TeamDialogProps) {
  if (!open) return null;
  const empty = nightsWithoutCook(restaurant);
  return (
    <Dialog
      open
      title="Team & schedule"
      onClose={onClose}
      className="ad-dialog--wide ck-team-dialog"
      footer={
        <>
          <HollisButton state={state} desk="team" dispatch={dispatch} />
          <Button onClick={onClose} data-testid="team-done">
            Done
          </Button>
        </>
      }
    >
      <p className="ck-dish-dialog__lead">Every night needs a cook. Nobody works more than four.</p>
      {restaurant.team.length === 0 ? (
        <p className="ck-muted">Hire a few people, then put them on the nights below.</p>
      ) : (
        <table className="ck-schedule">
          <thead>
            <tr>
              <th scope="col">Team</th>
              {SERVICE_NIGHTS.map((night) => (
                <th key={night} scope="col">
                  {nightLabel(night)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {restaurant.team.map((row) => {
              const member = staffById(row.staffId);
              if (member === undefined) return null;
              return (
                <tr key={row.staffId}>
                  <th scope="row">
                    {member.name}
                    <span className="ck-muted"> · {row.nights.length} of 4</span>
                  </th>
                  {SERVICE_NIGHTS.map((night) => {
                    const on = row.nights.includes(night);
                    const issue = shiftIssue(state, row.staffId, night);
                    return (
                      <td key={night}>
                        <button
                          type="button"
                          className={on ? "ck-shift ck-shift--on" : "ck-shift"}
                          aria-pressed={on}
                          aria-label={`${member.name} on ${weekdayName(night)}`}
                          disabled={issue !== null}
                          title={issue ?? undefined}
                          onClick={() => dispatch({ type: "toggleShift", staffId: row.staffId, night })}
                          data-testid={`shift-${row.staffId}-${night}`}
                        >
                          {on ? "✓" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <h3 className="ck-team-pool__title">People looking for work</h3>
      <div className="ck-team-pool" role="group" aria-label="People looking for work">
        {teamStaff().map((member) => {
          const hired = restaurant.team.some((row) => row.staffId === member.id);
          return (
            <article
              key={member.id}
              className={hired ? "ck-staff-card ck-staff-card--hired" : "ck-staff-card"}
            >
              <Avatar
                look={member.look}
                garment={chefWhites("#f2a93b")}
                size={56}
                title={member.name}
                frameColour="#dfe5e8"
              />
              <span className="ck-staff-card__name">{member.name}</span>
              <span className="ck-muted">
                {staffRoleLine(member)} · {member.wage} a night
              </span>
              <span className="ck-staff-card__note">{member.note}</span>
              {hired ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: "partWays", staffId: member.id })}
                >
                  Thank and part ways
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch({ type: "hireStaff", staffId: member.id })}
                  disabledReason={hireIssue(state, member.id) ?? undefined}
                  data-testid={`hire-${member.id}`}
                >
                  Hire
                </Button>
              )}
            </article>
          );
        })}
      </div>
      {empty.length > 0 ? (
        <p className="ck-team-warnings" role="status">
          Still needs a cook: {empty.map((night) => weekdayName(night)).join(", ")}.
        </p>
      ) : null}
    </Dialog>
  );
}
