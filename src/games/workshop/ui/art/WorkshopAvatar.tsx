import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import type { AvatarMood } from "../../../../ui/art/avatar/AvatarFace";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";

interface WorkshopAvatarProps {
  readonly look: AvatarLook;
  readonly mood?: AvatarMood | undefined;
  readonly pose?: AvatarPose | undefined;
  readonly title: string;
  readonly className?: string | undefined;
}

const OUTLINE = "#2f2622";

function Apron() {
  return (
    <g className="ww-avatar__apron" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M182 150 Q200 128 218 150" fill="none" stroke="#8f5a26" strokeWidth={4} />
      <path
        d="M178 166 H222 L226 236 Q250 238 252 252 L246 372 Q200 384 154 372 L148 252 Q150 238 174 236 Z"
        fill="#d8b88a"
      />
      <path
        d="M150 248 Q120 252 112 266 M250 248 Q280 252 288 266"
        fill="none"
        stroke="#8f5a26"
        strokeWidth={4}
      />
      <rect x={176} y={276} width={48} height={36} rx={5} fill="#c9a676" />
      <rect x={186} y={262} width={6} height={30} rx={2} fill="#f2c230" />
      <path d="M186 262 l3 -8 l3 8" fill="#2f2622" strokeWidth={1.5} />
      <path d="M210 270 h8 v26 h-8 Z" fill="#cfd6dc" strokeWidth={1.5} />
    </g>
  );
}

function Goggles() {
  return (
    <g transform="translate(200 81) scale(1.08)" className="ww-avatar__goggles">
      <path d="M-33 -6 Q0 -14 33 -6" fill="none" stroke="#33475a" strokeWidth={4.5} strokeLinecap="round" />
      <g stroke={OUTLINE} strokeWidth={1.8}>
        <rect x={-23} y={-7.5} width={20} height={15} rx={6} fill="#bfe4f2" fillOpacity={0.55} />
        <rect x={3} y={-7.5} width={20} height={15} rx={6} fill="#bfe4f2" fillOpacity={0.55} />
        <rect x={-4} y={-3} width={8} height={5} rx={2} fill="#f2c230" />
      </g>
      <path d="M-19 -4 l4 -2 M7 -4 l4 -2" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

export function WorkshopApron() {
  return (
    <>
      <Apron />
      <Goggles />
    </>
  );
}

export function WorkshopAvatar({ look, mood = "happy", pose, title, className }: WorkshopAvatarProps) {
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={title}>
      <AvatarFigure look={look} mood={mood} pose={pose} />
      <WorkshopApron />
    </svg>
  );
}
