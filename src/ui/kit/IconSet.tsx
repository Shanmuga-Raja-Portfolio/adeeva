import type { ReactNode } from "react";

export type IconName =
  | "coin"
  | "star"
  | "sparkle"
  | "clock"
  | "calendar"
  | "scissors"
  | "needle"
  | "hanger"
  | "palette"
  | "bag"
  | "heart"
  | "megaphone"
  | "close"
  | "check"
  | "lock"
  | "home"
  | "shield"
  | "back";

export interface IconProps {
  name: IconName;
  size?: number | undefined;
  title?: string | undefined;
  className?: string | undefined;
}

const glyphs: Record<IconName, ReactNode> = {
  coin: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18" />
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6" opacity="0.6" />
      <path d="M12 8.6v6.8M10 10.2c0-.9.9-1.5 2-1.5s2 .6 2 1.4c0 1.9-4 1-4 2.9 0 .8.9 1.4 2 1.4s2-.6 2-1.5" />
    </>
  ),
  star: (
    <path
      d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6l-5.3 2.9 1.1-5.9-4.4-4.1 6-.8z"
      fill="currentColor"
      fillOpacity="0.2"
    />
  ),
  sparkle: (
    <>
      <path
        d="M10 3c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M18 14c.3 1.8 1.1 2.6 3 3-1.9.4-2.7 1.2-3 3-.3-1.8-1.1-2.6-3-3 1.9-.4 2.7-1.2 3-3z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" fill="currentColor" fillOpacity="0.14" />
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.6" y="5.4" width="16.8" height="15" rx="2.6" fill="currentColor" fillOpacity="0.14" />
      <rect x="3.6" y="5.4" width="16.8" height="15" rx="2.6" />
      <path d="M3.6 10h16.8M8 3.4v4M16 3.4v4" />
      <circle cx="8.4" cy="14.4" r="0.9" fill="currentColor" />
      <circle cx="12" cy="14.4" r="0.9" fill="currentColor" />
      <circle cx="15.6" cy="14.4" r="0.9" fill="currentColor" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.4" cy="17.4" r="2.9" />
      <circle cx="17.6" cy="17.4" r="2.9" />
      <path d="M8.4 15.3L17 4M15.6 15.3L7 4" />
    </>
  ),
  needle: (
    <>
      <path d="M4.5 19.5L17.8 6.2" />
      <path d="M16.2 4.6a2.3 2.3 0 0 1 3.2 3.2l-1.6 1.6-3.2-3.2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M17.6 6.4l.4-.4" />
      <path d="M9 15c-2.5-1.8-5.6-1-6 1.5-.4 2.4 2.4 3.4 4 2" opacity="0.7" />
    </>
  ),
  hanger: (
    <>
      <path d="M12 8.4V7.6a2.2 2.2 0 1 1 2.2-2.2" />
      <path
        d="M12 8.4L3.4 15.6c-.8.7-.3 1.9.7 1.9h15.8c1 0 1.5-1.2.7-1.9z"
        fill="currentColor"
        fillOpacity="0.14"
      />
    </>
  ),
  palette: (
    <>
      <path
        d="M12 3.4c-5 0-8.8 3.6-8.8 8.2 0 4.5 3.6 8.4 8 8.4 1.4 0 2-.9 2-1.8 0-1.2-1-1.6-1-2.6 0-1 .8-1.6 1.8-1.6h2.4c2.6 0 4.4-1.8 4.4-4.4 0-3.6-3.8-6.2-8.8-6.2z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <circle cx="7.6" cy="11.2" r="1.3" fill="currentColor" />
      <circle cx="10.4" cy="7.4" r="1.3" fill="currentColor" />
      <circle cx="15" cy="7.6" r="1.3" fill="currentColor" />
    </>
  ),
  bag: (
    <>
      <path d="M5.2 8h13.6l-1 12.2H6.2z" fill="currentColor" fillOpacity="0.14" />
      <path d="M5.2 8h13.6l-1 12.2H6.2z" />
      <path d="M8.8 10.4V7a3.2 3.2 0 0 1 6.4 0v3.4" />
    </>
  ),
  heart: (
    <path
      d="M12 20s-7.8-4.6-7.8-10.2C4.2 7 6.2 5 8.6 5c1.5 0 2.7.8 3.4 2 .7-1.2 1.9-2 3.4-2 2.4 0 4.4 2 4.4 4.8C19.8 15.4 12 20 12 20z"
      fill="currentColor"
      fillOpacity="0.2"
    />
  ),
  megaphone: (
    <>
      <path
        d="M4 10v4c0 .6.4 1 1 1h2.6L15.8 19V5L7.6 9H5c-.6 0-1 .4-1 1z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M4 10v4c0 .6.4 1 1 1h2.6L15.8 19V5L7.6 9H5c-.6 0-1 .4-1 1z" />
      <path d="M8 15l1.2 4.4h2.4L10.6 16M18.6 9.4c.9.7.9 4.5 0 5.2M20.6 7.6c1.9 1.9 1.9 6.9 0 8.8" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="M5 12.6l4.4 4.4L19 7.4" />,
  lock: (
    <>
      <rect x="5.2" y="10.4" width="13.6" height="10" rx="2.4" fill="currentColor" fillOpacity="0.14" />
      <rect x="5.2" y="10.4" width="13.6" height="10" rx="2.4" />
      <path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 7.2 0v2.8" />
      <circle cx="12" cy="15.4" r="1.2" fill="currentColor" />
    </>
  ),
  home: (
    <>
      <path
        d="M4.2 11.2L12 4.6l7.8 6.6V19a1.4 1.4 0 0 1-1.4 1.4H5.6A1.4 1.4 0 0 1 4.2 19z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M4.2 11.2L12 4.6l7.8 6.6V19a1.4 1.4 0 0 1-1.4 1.4H5.6A1.4 1.4 0 0 1 4.2 19z" />
      <path d="M9.8 20.4v-5.2h4.4v5.2" />
    </>
  ),
  shield: (
    <>
      <path
        d="M12 3.4l7 2.6v5.4c0 4.4-3 7.8-7 9.2-4-1.4-7-4.8-7-9.2V6z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M12 3.4l7 2.6v5.4c0 4.4-3 7.8-7 9.2-4-1.4-7-4.8-7-9.2V6z" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </>
  ),
  back: <path d="M14.6 5.6L8.2 12l6.4 6.4" />,
};

export function Icon({ name, size = 20, title, className }: IconProps) {
  const labelled = title !== undefined && title.length > 0;
  return (
    <svg
      className={className ? `ad-icon ${className}` : "ad-icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? "img" : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      {glyphs[name]}
    </svg>
  );
}
