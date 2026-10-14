import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { STATION_DEFS, type StationId } from "../../../content/station";
import { staffById, type ServiceRun } from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { StationIcon } from "../../art/StationIcon";

export interface StationTabsProps {
  readonly service: ServiceRun;
  readonly active: StationId;
  readonly counts: Readonly<Record<StationId, number>>;
  readonly alerts: readonly StationId[];
  readonly reducedMotion: boolean;
  readonly assigning: string | null;
  readonly onPick: (station: StationId) => void;
}

export function StationTabs({
  service,
  active,
  counts,
  alerts,
  reducedMotion,
  assigning,
  onPick,
}: StationTabsProps) {
  return (
    <nav className="ck-tabs" aria-label="Stations">
      {STATION_DEFS.map((station) => {
        const helper = service.staff.find((member) => member.station === station.id);
        const def = helper === undefined ? undefined : staffById(helper.staffId);
        const alert = alerts.includes(station.id);
        return (
          <button
            key={station.id}
            type="button"
            data-station={station.id}
            aria-pressed={active === station.id}
            className={[
              "ck-tab",
              active === station.id ? "ck-tab--active" : "",
              alert ? (reducedMotion ? "ck-tab--alert-still" : "ck-tab--alert") : "",
              assigning !== null ? "ck-tab--target" : "",
            ]
              .filter((name) => name.length > 0)
              .join(" ")}
            onClick={() => onPick(station.id)}
            data-testid={`tab-${station.id}`}
          >
            <StationIcon station={station.id} />
            <span className="ck-tab__name">{station.name}</span>
            <span className="ck-tab__game">{station.game}</span>
            {counts[station.id] > 0 ? <span className="ck-tab__count">{counts[station.id]}</span> : null}
            {def !== undefined ? (
              <span className="ck-tab__helper">
                <Avatar
                  look={def.look}
                  garment={chefWhites("#f2a93b")}
                  size={30}
                  title={`${def.name} is here`}
                  frameColour="#dfe5e8"
                />
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
