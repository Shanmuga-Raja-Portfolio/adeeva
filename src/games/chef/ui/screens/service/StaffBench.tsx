import { useState, type PointerEvent } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { STATION_DEFS, type StationId } from "../../../content/station";
import { staffById, staffSkill, type ServiceRun } from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import type { TraitId } from "../../../../../engine/trait";

export interface StaffBenchProps {
  readonly service: ServiceRun;
  readonly trait: TraitId;
  readonly assigning: string | null;
  readonly onAssigning: (staffId: string | null) => void;
  readonly onAssign: (staffId: string, station: StationId | null) => void;
}

function stationUnder(clientX: number, clientY: number): StationId | null {
  const element = document.elementFromPoint(clientX, clientY)?.closest("[data-station]");
  const station = element?.getAttribute("data-station");
  return STATION_DEFS.find((entry) => entry.id === station)?.id ?? null;
}

export function StaffBench({ service, trait, assigning, onAssigning, onAssign }: StaffBenchProps) {
  const [drag, setDrag] = useState<{
    readonly id: string;
    readonly x: number;
    readonly y: number;
    readonly moved: boolean;
  } | null>(null);
  if (service.staff.length === 0) return null;
  const down = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id, x: event.clientX, y: event.clientY, moved: false });
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null) return;
    const moved = drag.moved || Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8;
    if (moved !== drag.moved) setDrag({ ...drag, moved });
  };
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null) return;
    if (drag.moved) {
      const station = stationUnder(event.clientX, event.clientY);
      if (station !== null) onAssign(drag.id, station);
      onAssigning(null);
    } else onAssigning(assigning === drag.id ? null : drag.id);
    setDrag(null);
  };
  return (
    <section className="ck-staff" aria-label="Your helpers">
      <span className="ad-eyebrow">Helpers</span>
      {service.staff.map((member) => {
        const def = staffById(member.staffId);
        if (def === undefined) return null;
        const station = STATION_DEFS.find((entry) => entry.id === member.station);
        return (
          <button
            key={member.staffId}
            type="button"
            className={
              assigning === member.staffId ? "ck-staff__card ck-staff__card--picking" : "ck-staff__card"
            }
            onPointerDown={(event) => down(event, member.staffId)}
            onPointerMove={move}
            onPointerUp={up}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onAssigning(assigning === member.staffId ? null : member.staffId);
            }}
            aria-pressed={assigning === member.staffId}
            aria-label={`${def.name}, ${station === undefined ? "resting" : `on the ${station.name}`}. Drag onto a station, or select then pick a station.`}
            data-testid={`staff-${member.staffId}`}
          >
            <Avatar
              look={def.look}
              garment={chefWhites("#f2a93b")}
              size={44}
              title={def.name}
              frameColour="#dfe5e8"
            />
            <span className="ck-staff__name">{def.name.split(" ")[0]}</span>
            <span className="ck-staff__where">
              {station === undefined
                ? "Drag me to a station"
                : `${station.name} · ${Math.round(staffSkill(def, station.id, trait) * 100)}%`}
            </span>
          </button>
        );
      })}
      {assigning !== null ? (
        <button type="button" className="ck-pause" onClick={() => onAssign(assigning, null)}>
          Give them a rest
        </button>
      ) : null}
    </section>
  );
}
