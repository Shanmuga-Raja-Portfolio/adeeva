import { Icon } from "../../../../../ui/kit/IconSet";

const RAYS = Array.from({ length: 12 }, (_, index) => index);
const SPARKS: readonly [number, number, string][] = [
  [-118, -96, "#f7c548"],
  [112, -104, "#f2a7bd"],
  [-132, 10, "#a9c98b"],
  [128, 4, "#f7c548"],
  [-80, -140, "#9fd0ee"],
  [86, -146, "#b9a7dc"],
  [-30, -168, "#f2a7bd"],
  [36, -170, "#f7c548"],
];

export function WeighBurst() {
  return (
    <span className="pa-weigh-burst" aria-hidden="true">
      <span className="pa-weigh-burst__glow" />
      {RAYS.map((index) => (
        <span key={index} className="pa-weigh-burst__ray" style={{ rotate: `${index * 30}deg` }} />
      ))}
      {SPARKS.map(([x, y, colour], index) => (
        <span
          key={`${x}-${y}`}
          className="pa-weigh-burst__spark"
          style={{ translate: `${x}px ${y}px`, background: colour, animationDelay: `${index * 40}ms` }}
        />
      ))}
      <span className="pa-weigh-burst__stamp">
        <Icon name="check" size={34} />
      </span>
    </span>
  );
}
