import { memo, type CSSProperties } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon, type IconName } from "../../../../../ui/kit/IconSet";

export interface ShowcaseFan {
  readonly name: string;
  readonly look: AvatarLook;
}

export interface ShowcaseCrowdProps {
  readonly members: readonly ShowcaseFan[];
  readonly cheering: boolean;
  readonly clapping: boolean;
}

const CHEERS: readonly IconName[] = ["heart", "star", "sparkle", "heart", "star"];
const CROWD_POSES = ["cheer", "poised", "chat", "present", "poised-right", "graceful"] as const;
const CROWD_SIZES = [1, 0.9, 1.08, 0.95, 1.04, 0.92];

export const ShowcaseCrowd = memo(function ShowcaseCrowd({
  members,
  cheering,
  clapping,
}: ShowcaseCrowdProps) {
  return (
    <div
      className={clapping ? "pa-showcase__crowd pa-showcase__crowd--clap" : "pa-showcase__crowd"}
      aria-hidden="true"
    >
      <span className="pa-showcase__bench" />
      {members.map((member, at) => {
        const underCake = Math.abs(at - (members.length - 1) / 2) < 1.5;
        const cheer = underCake ? null : (CHEERS[at % CHEERS.length] ?? null);
        const pose = {
          animationDelay: `${(at % 4) * 120}ms`,
          "--lean": `${((at % 3) - 1) * 4}deg`,
          "--lift": `${(at % 2) * -1.2}cqi`,
          "--size": CROWD_SIZES[at % CROWD_SIZES.length],
          "--flip": at % 2 === 0 ? 1 : -1,
        } as CSSProperties;
        return (
          <span key={member.name} className="pa-showcase__fan" style={pose}>
            <span className="pa-showcase__body">
              <Avatar
                variant="three-quarter"
                look={member.look}
                mood={cheering ? "delighted" : "happy"}
                pose={cheering ? CROWD_POSES[at % CROWD_POSES.length] : "rest"}
                title={member.name}
              />
            </span>
            {cheering && cheer !== null ? (
              <span className={`pa-showcase__cheer pa-showcase__cheer--${cheer}`}>
                <Icon name={cheer} size={30} />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
});
