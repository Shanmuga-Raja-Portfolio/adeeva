import { useEffect, useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { VISITOR_LOOKS } from "../../../content/visitor";
import { roomById, VISITORS, walkThrough, type MakeoverRun, type OpenHouse } from "../../../core";
import { cutawayFrame, floorPoint } from "../../art/cutawayFrame";
import { RoomCutaway } from "../../art/RoomCutaway";
import { FINISHED, roomLook } from "../../art/roomLook";

const STEP_MS = 700;

export function OpenHousePanel({ run, visit }: { readonly run: MakeoverRun; readonly visit: OpenHouse }) {
  const { reducedMotion } = useSettings();
  const [tick, setTick] = useState(0);
  const room = roomById(run.brief.roomId);
  const frame = cutawayFrame(room);
  const path = [...walkThrough(room, run.plan.pieces, 1).reached].map(
    (key) => key.split(",").map(Number) as [number, number],
  );

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), STEP_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="is-open-house" aria-labelledby="is-open-house-title" data-testid="open-house">
      <header>
        <span className="ad-eyebrow">Bellwind Homes</span>
        <h2 id="is-open-house-title">Open House</h2>
      </header>
      <RoomCutaway
        look={roomLook(run, FINISHED)}
        title="Visitors walking through the show home"
        className="is-open-house__room"
      >
        {path.length === 0
          ? null
          : VISITOR_LOOKS.slice(0, VISITORS).map((look, index) => {
              const cell = path[(tick + index * 3) % path.length] ?? path[0] ?? [0, 0];
              const [x, y] = floorPoint(frame, cell[0] + 0.5, cell[1] + 0.6);
              return (
                <g
                  key={index}
                  className={reducedMotion ? "is-walker" : "is-walker is-walker--smooth"}
                  style={{ transform: `translate(${x - 18}px, ${y - 40}px)` }}
                >
                  <Avatar look={look} size={36} title="Visitor" frameColour="#fffaf2" />
                </g>
              );
            })}
      </RoomCutaway>
      <div className="is-open-house__panels">
        {visit.panels.map((panel) => (
          <div key={panel.id} className="is-panel-card">
            <span className="is-panel-card__label">{panel.label}</span>
            <strong className="is-panel-card__score">{panel.score}</strong>
          </div>
        ))}
      </div>
      <p className="is-open-house__quote">“{visit.quote}”</p>
      <p className="is-open-house__total">
        <Icon name="star" size={16} /> Open House score {visit.score} · {visit.enquiries}{" "}
        {visit.enquiries === 1 ? "enquiry" : "enquiries"} · <Icon name="coin" size={16} /> +{visit.coins}
      </p>
    </section>
  );
}
