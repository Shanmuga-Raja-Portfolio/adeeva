import type { ReactNode } from "react";

export type InstallScene =
  | "android-menu"
  | "android-install"
  | "phone-home"
  | "address-install"
  | "install-dialog"
  | "add-dialog"
  | "desktop-app"
  | "safari-share"
  | "share-sheet"
  | "share-add"
  | "mac-file-menu"
  | "mac-dock";

function AppIcon({ x, y, size }: { readonly x: number; readonly y: number; readonly size: number }) {
  const r = size / 2;
  const s = size / 48;
  return (
    <g transform={`translate(${x - r} ${y - r})`}>
      <rect width={size} height={size} rx={size * 0.22} className="st-pic__wall" />
      <circle cx={r} cy={r} r={r * 0.69} className="st-pic__rose" />
      <path
        d={`M${15 * s} ${32 * s} L${24 * s} ${13 * s} L${33 * s} ${32 * s} M${18.5 * s} ${25 * s} L${29.5 * s} ${25 * s}`}
        className="st-pic__mark"
        strokeWidth={Math.max(1.2, 3 * s)}
      />
    </g>
  );
}

function Spot({ x, y, r = 9 }: { readonly x: number; readonly y: number; readonly r?: number }) {
  return <circle cx={x} cy={y} r={r} className="st-pic__spot" />;
}

function Phone({ children }: { readonly children: ReactNode }) {
  return (
    <g>
      <rect x={50} y={4} width={60} height={112} rx={10} className="st-pic__device" />
      <rect x={54} y={10} width={52} height={100} rx={5} className="st-pic__screen" />
      {children}
    </g>
  );
}

function Laptop({ children }: { readonly children: ReactNode }) {
  return (
    <g>
      <rect x={18} y={8} width={124} height={80} rx={6} className="st-pic__device" />
      <rect x={23} y={13} width={114} height={70} rx={3} className="st-pic__screen" />
      <path d="M8 92 h144 l-8 10 h-128 Z" className="st-pic__device" />
      {children}
    </g>
  );
}

function BrowserBar({ y = 13 }: { readonly y?: number }) {
  return (
    <g>
      <rect x={23} y={y} width={114} height={14} className="st-pic__chrome" />
      <rect x={30} y={y + 3} width={90} height={8} rx={4} className="st-pic__field" />
    </g>
  );
}

function Row({
  y,
  label,
  picked = false,
}: {
  readonly y: number;
  readonly label: string;
  readonly picked?: boolean;
}) {
  return (
    <g>
      <rect
        x={57}
        y={y}
        width={46}
        height={10}
        rx={2}
        className={picked ? "st-pic__picked" : "st-pic__row"}
      />
      <text
        x={59}
        y={y + 6.8}
        textLength={label.length > 14 ? 42 : undefined}
        lengthAdjust="spacingAndGlyphs"
        className={picked ? "st-pic__label st-pic__label--on" : "st-pic__label"}
      >
        {label}
      </text>
    </g>
  );
}

function AskDialog({ question, action }: { readonly question: string; readonly action: string }) {
  return (
    <Laptop>
      <BrowserBar />
      <rect x={70} y={29} width={62} height={38} rx={3} className="st-pic__sheet" />
      <AppIcon x={80} y={40} size={10} />
      <text x={88} y={42} className="st-pic__label">
        {question}
      </text>
      <rect x={106} y={54} width={22} height={9} rx={4.5} className="st-pic__picked" />
      <text x={117} y={60.5} textAnchor="middle" className="st-pic__label st-pic__label--on">
        {action}
      </text>
    </Laptop>
  );
}

const SCENES: Record<InstallScene, ReactNode> = {
  "android-menu": (
    <Phone>
      <rect x={54} y={10} width={52} height={12} className="st-pic__chrome" />
      <rect x={57} y={13} width={36} height={6} rx={3} className="st-pic__field" />
      <circle cx={99} cy={14} r={0.9} className="st-pic__ink" />
      <circle cx={99} cy={16} r={0.9} className="st-pic__ink" />
      <circle cx={99} cy={18} r={0.9} className="st-pic__ink" />
      <Spot x={99} y={16} r={6} />
      <AppIcon x={80} y={62} size={22} />
    </Phone>
  ),
  "android-install": (
    <Phone>
      <rect x={56} y={14} width={48} height={60} rx={3} className="st-pic__sheet" />
      <Row y={18} label="New tab" />
      <Row y={31} label="Bookmarks" />
      <Row y={44} label="Install app" picked />
      <Row y={57} label="Settings" />
    </Phone>
  ),
  "phone-home": (
    <Phone>
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={60 + col * 15}
            y={22 + row * 18}
            width={10}
            height={10}
            rx={3}
            className="st-pic__row"
          />
        )),
      )}
      <AppIcon x={80} y={80} size={18} />
      <Spot x={80} y={80} r={13} />
    </Phone>
  ),
  "address-install": (
    <Laptop>
      <BrowserBar />
      <rect x={108} y={17} width={8} height={6} rx={1} className="st-pic__ink-line" />
      <path d="M112 18.5 v3 M110.5 20 l1.5 1.5 l1.5 -1.5" className="st-pic__ink-line" />
      <Spot x={112} y={20} r={7} />
      <AppIcon x={80} y={56} size={24} />
    </Laptop>
  ),
  "install-dialog": <AskDialog question="Install app?" action="Install" />,
  "add-dialog": <AskDialog question="Add to Dock?" action="Add" />,
  "desktop-app": (
    <Laptop>
      <rect x={23} y={73} width={114} height={10} className="st-pic__chrome" />
      {[40, 54, 68, 96, 110].map((x) => (
        <rect key={x} x={x - 4} y={75} width={8} height={6} rx={2} className="st-pic__row" />
      ))}
      <AppIcon x={82} y={78} size={8} />
      <Spot x={82} y={78} r={7} />
      <rect x={34} y={20} width={92} height={46} rx={3} className="st-pic__sheet" />
      <AppIcon x={80} y={43} size={20} />
    </Laptop>
  ),
  "safari-share": (
    <Phone>
      <rect x={54} y={96} width={52} height={14} className="st-pic__chrome" />
      <rect x={76} y={100} width={8} height={7} rx={1} className="st-pic__ink-line" />
      <path d="M80 97 v6 M78 99 l2 -2 l2 2" className="st-pic__ink-line" />
      <Spot x={80} y={102} r={7} />
      <rect x={57} y={13} width={46} height={6} rx={3} className="st-pic__field" />
      <AppIcon x={80} y={55} size={22} />
    </Phone>
  ),
  "share-sheet": (
    <Phone>
      <rect x={54} y={40} width={52} height={70} rx={5} className="st-pic__sheet" />
      <Row y={46} label="Copy" />
      <Row y={59} label="Add to Home Screen" picked />
      <Row y={72} label="Add Bookmark" />
      <Row y={85} label="Find on Page" />
    </Phone>
  ),
  "share-add": (
    <Phone>
      <rect x={54} y={10} width={52} height={12} className="st-pic__chrome" />
      <rect x={91} y={12} width={13} height={8} rx={4} className="st-pic__picked" />
      <text x={93.5} y={18} className="st-pic__label st-pic__label--on">
        Add
      </text>
      <AppIcon x={68} y={36} size={14} />
      <rect x={78} y={32} width={24} height={8} rx={2} className="st-pic__field" />
    </Phone>
  ),
  "mac-file-menu": (
    <Laptop>
      <rect x={23} y={13} width={114} height={7} className="st-pic__chrome" />
      <text x={34} y={18.5} className="st-pic__label">
        Safari
      </text>
      <rect x={50} y={13} width={14} height={7} className="st-pic__picked" />
      <text x={52} y={18.5} className="st-pic__label st-pic__label--on">
        File
      </text>
      <rect x={50} y={20} width={50} height={36} rx={2} className="st-pic__sheet" />
      <text x={53} y={29} className="st-pic__label">
        New Window
      </text>
      <rect x={51} y={35} width={48} height={9} rx={2} className="st-pic__picked" />
      <text x={53} y={41.5} className="st-pic__label st-pic__label--on">
        Add to Dock…
      </text>
      <text x={53} y={52} className="st-pic__label">
        Close Window
      </text>
    </Laptop>
  ),
  "mac-dock": (
    <Laptop>
      <rect x={42} y={70} width={76} height={11} rx={4} className="st-pic__chrome" />
      {[50, 62, 74, 98, 110].map((x) => (
        <rect key={x} x={x - 4} y={72} width={8} height={7} rx={2} className="st-pic__row" />
      ))}
      <AppIcon x={86} y={75.5} size={8} />
      <Spot x={86} y={75.5} r={7} />
    </Laptop>
  ),
};

export function InstallPicture({ scene }: { readonly scene: InstallScene }) {
  return (
    <svg
      className="st-pic"
      viewBox="0 0 160 120"
      aria-hidden="true"
      focusable="false"
      data-scene={scene}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SCENES[scene]}
    </svg>
  );
}
