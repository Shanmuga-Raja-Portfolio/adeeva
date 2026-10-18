import { memo } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { AvatarFigure } from "../../../../../ui/art/avatar/Avatar";

export interface CrowdMember {
  readonly name: string;
  readonly look: AvatarLook;
}

export interface FairCrowdProps {
  readonly members: readonly CrowdMember[];
  readonly clapping: boolean;
}

export const FairCrowd = memo(function FairCrowd({ members, clapping }: FairCrowdProps) {
  return (
    <div
      className={clapping ? "ww-reveal__crowd ww-reveal__crowd--clap" : "ww-reveal__crowd"}
      aria-hidden="true"
    >
      {members.map((member, at) => (
        <span
          key={member.name}
          className={at % 2 === 0 ? "ww-reveal__fan" : "ww-reveal__fan ww-reveal__fan--back"}
          style={{ animationDelay: `${(at % 4) * 120}ms` }}
        >
          <svg viewBox="40 0 320 470">
            <AvatarFigure
              look={member.look}
              mood={clapping ? "delighted" : "happy"}
              pose={clapping ? (at % 3 === 0 ? "cheer" : at % 3 === 1 ? "wave" : "present") : "rest"}
            />
          </svg>
        </span>
      ))}
    </div>
  );
});
