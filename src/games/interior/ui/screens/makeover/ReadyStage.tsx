import { useEffect } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { BUILDER_LOOK } from "../../../content/larkspurStoryBeat";
import { glowPath, placedLights, roomQuality, runRoom, tellsStory, walkThrough } from "../../../core";
import { RoomCutaway } from "../../art/RoomCutaway";
import { FINISHED, roomLook } from "../../art/roomLook";
import { homeRoomContext } from "./homeRoomContext";
import type { StageProps } from "./stageProps";
import "./reveal.css";

const READY_MARK = 70;
const CHALLENGING_BONUS = 6;

interface Check {
  readonly id: string;
  readonly label: string;
  readonly good: boolean;
}

export function ReadyStage({ state, run, onExit }: StageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
    focusHeading();
  }, []);
  const context = homeRoomContext(state, run);
  if (context === null) return null;
  const room = runRoom(run);
  const quality = roomQuality(state, run).quality;
  const mark = READY_MARK + (state.profile.difficulty === "challenging" ? CHALLENGING_BONUS : 0);
  const walk = walkThrough(room, run.plan.pieces, 1);
  const glow = glowPath(room, run.plan.pieces, placedLights(run));
  const wall = run.plan.wallPaint;
  const checks: Check[] = [
    ...(walk.throughReached === null
      ? []
      : [
          {
            id: "through",
            label: walk.throughReached ? "A clear path to the next door" : "The next door is blocked",
            good: walk.throughReached,
          },
        ]),
    ...(glow === null
      ? []
      : [
          {
            id: "glow",
            label: `${glow.glowing} of ${glow.cells.length} steps glow`,
            good: glow.glowing === glow.cells.length,
          },
        ]),
    {
      id: "story",
      label: tellsStory(run, context.story)
        ? "Tells the family's story"
        : "Add a story piece and a story colour",
      good: tellsStory(run, context.story),
    },
    {
      id: "palette",
      label:
        wall !== null && context.project.palette.paints.includes(wall)
          ? "Walls from the home palette"
          : "Walls off the home palette",
      good: wall !== null && context.project.palette.paints.includes(wall),
    },
  ];
  return (
    <div className="is-reveal is-ready" data-testid="ready-stage">
      <header className="is-reveal__header">
        <Button variant="ghost" icon="back" onClick={onExit} data-testid="back-to-home">
          Back to the home
        </Button>
        <div>
          <span className="ad-eyebrow">
            {context.purpose.name} · {context.plot.name}
          </span>
          <h1>Ready for visitors</h1>
        </div>
      </header>
      <div className="is-ready__body">
        <div className="is-ready__room">
          <RoomCutaway
            look={roomLook(run, FINISHED)}
            title={`The finished ${context.purpose.name}`}
            className="is-ready__cutaway"
          />
          <span className="is-ready__badge" aria-hidden="true">
            <Icon name="sparkle" size={18} /> Ready!
          </span>
        </div>
        <aside className="is-ready__card is-tape-card">
          <div className="is-ready__achebe">
            <Avatar
              look={BUILDER_LOOK}
              mood={quality >= mark ? "delighted" : "happy"}
              size={84}
              title="Ms. Achebe"
              frameColour="#fcefc2"
            />
            <p>
              {quality >= mark
                ? "Ready for visitors! This room will make them smile."
                : "Ready for visitors. A little more care next time will make it shine."}
            </p>
          </div>
          <p className="is-ready__quality">
            <span>Room quality</span>
            <strong data-testid="ready-quality">{quality}</strong>
            <span className="is-muted">Ready mark {mark}</span>
          </p>
          <ul className="is-ready__checks">
            {checks.map((check) => (
              <li
                key={check.id}
                className={check.good ? "is-ready__check is-ready__check--good" : "is-ready__check"}
              >
                <Icon name={check.good ? "check" : "heart"} size={16} /> {check.label}
              </li>
            ))}
          </ul>
          <Button size="lg" icon="home" onClick={onExit} data-testid="ready-done">
            Back to the home
          </Button>
        </aside>
      </div>
    </div>
  );
}
