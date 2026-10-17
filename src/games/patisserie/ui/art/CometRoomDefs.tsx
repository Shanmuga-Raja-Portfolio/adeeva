import { SeatClip } from "./SeatedGuest";

export function CometRoomDefs({ id, daylight }: { readonly id: string; readonly daylight: boolean }) {
  return (
    <defs>
      <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff8dc" stopOpacity={0.55} />
        <stop offset="0.6" stopColor="#fff8dc" stopOpacity={0.18} />
        <stop offset="1" stopColor="#fff8dc" stopOpacity={0} />
      </linearGradient>
      <radialGradient id={`${id}-bulb`}>
        <stop offset="0" stopColor="#fff2b8" stopOpacity={0.95} />
        <stop offset="1" stopColor="#ffd77a" stopOpacity={0} />
      </radialGradient>
      <radialGradient id={`${id}-lamp`}>
        <stop offset="0" stopColor="#fff2c9" stopOpacity={0.85} />
        <stop offset="0.5" stopColor="#ffe3a8" stopOpacity={0.3} />
        <stop offset="1" stopColor="#fff2c9" stopOpacity={0} />
      </radialGradient>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3e3ee" />
        <stop offset="1" stopColor="#fbf1f6" />
      </linearGradient>
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a8714b" />
        <stop offset="1" stopColor="#7d5133" />
      </linearGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffbe8" stopOpacity={daylight ? 0.5 : 0.18} />
        <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
      </linearGradient>
      <radialGradient id={`${id}-vignette`} cx="0.45" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#3b2620" stopOpacity={0} />
        <stop offset="1" stopColor="#3b2620" stopOpacity={0.28} />
      </radialGradient>
      <SeatClip id={`${id}-seat`} />
      <pattern id={`${id}-rug`} width="40" height="20" patternUnits="userSpaceOnUse">
        <rect width="40" height="20" fill="#c86f8f" />
        <path d="M0 10 L10 0 L20 10 L10 20 Z M20 10 L30 0 L40 10 L30 20 Z" fill="#d98aa6" />
      </pattern>
    </defs>
  );
}
