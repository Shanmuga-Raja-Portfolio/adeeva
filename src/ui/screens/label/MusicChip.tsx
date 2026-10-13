export interface MusicChipProps {
  name: string;
  elapsed: number;
  playing: boolean;
}

const BARS = [0, 1, 2, 3, 4];

export function MusicChip({ name, elapsed, playing }: MusicChipProps) {
  return (
    <span className="ad-music-chip" aria-label={`Music: ${name}`}>
      <span className="ad-music-chip__bars" aria-hidden="true">
        {BARS.map((bar) => {
          const level = playing
            ? 0.25 + 0.75 * Math.abs(Math.sin(elapsed / (170 + bar * 37) + bar * 1.7))
            : 0.35 + bar * 0.12;
          return <i key={bar} style={{ transform: `scaleY(${level.toFixed(3)})` }} />;
        })}
      </span>
      {name}
    </span>
  );
}
