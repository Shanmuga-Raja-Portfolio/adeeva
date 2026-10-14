import { weekdayName } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { FESTIVALS, type FestivalId } from "../../../content/festival";
import { festivalById, festivalToday, type GameState, type TruckState } from "../../../core";

export interface FestivalMapProps {
  readonly state: GameState;
  readonly truck: TruckState;
  readonly onServe: () => void;
  readonly onService: () => void;
}

const PINS: Readonly<Record<FestivalId, readonly [number, number]>> = {
  "kite-day": [90, 70],
  "harvest-fair": [230, 52],
  "night-market": [330, 128],
  "music-weekend": [520, 190],
  "book-fair": [150, 150],
  "blossom-market": [420, 66],
  "sports-final": [560, 78],
  "winter-lights": [250, 196],
};

function MapArt({ truck, today }: { readonly truck: TruckState; readonly today: FestivalId | null }) {
  const week = new Map(truck.board.map((slot) => [slot.festivalId, slot]));
  return (
    <svg
      viewBox="0 0 640 240"
      className="ck-festival-map__art"
      role="img"
      aria-label="Map of Larkspur festivals"
    >
      <rect width={640} height={240} rx={14} fill="#e9dfc4" />
      <path d="M0 210 Q160 180 320 214 T640 200 V240 H0 Z" fill="#7cc6d6" />
      <path d="M300 0 Q280 60 330 110 T360 240" fill="none" stroke="#9fd3e8" strokeWidth={16} />
      <path
        d="M40 40 q40 -30 80 0 M180 30 q30 -24 60 0 M500 40 q40 -30 80 0"
        fill="none"
        stroke="#a9c3a1"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path d="M60 120 H600 M200 20 V220" stroke="#d6c7a2" strokeWidth={6} strokeDasharray="10 8" />
      {FESTIVALS.map((festival) => {
        const [x, y] = PINS[festival.id];
        const slot = week.get(festival.id);
        const ribbon = truck.ribbons.includes(festival.id);
        const visited = truck.visited.includes(festival.id);
        const isToday = today === festival.id;
        return (
          <g
            key={festival.id}
            transform={`translate(${x} ${y})`}
            className={isToday ? "ck-pin ck-pin--today" : "ck-pin"}
          >
            {isToday ? <circle r={24} fill="#f2a93b" opacity={0.35} className="ck-pulse" /> : null}
            <path
              d="M0 14 C-14 -2 -12 -18 0 -18 C12 -18 14 -2 0 14 Z"
              fill={slot === undefined ? "#aeb9bf" : festival.flag}
              stroke="#2e3a40"
              strokeWidth={2}
            />
            <circle cy={-6} r={5} fill="#fff" />
            {visited ? <path d="M-4 -6 l3 3 l6 -6" stroke="#4f8a3c" strokeWidth={2.5} fill="none" /> : null}
            {ribbon ? (
              <g transform="translate(14 -16)">
                <path d="M0 6 l-4 10 l4 -3 l4 3 Z" fill="#2f6fb5" />
                <circle cy={4} r={6} fill="#3d84d6" stroke="#f3f0e8" strokeWidth={1.5} />
              </g>
            ) : null}
            {slot === undefined ? null : (
              <text
                y={30}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="#2e3a40"
                className="ck-scene-label"
              >
                {weekdayName(slot.day).slice(0, 3)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function LastFestival({ truck, onReport }: { readonly truck: TruckState; readonly onReport: () => void }) {
  const last = truck.lastFestival;
  if (last === null) return null;
  return (
    <p className="ck-festival-map__last">
      Last time: {festivalById(last.festivalId).name}
      {last.ribbon ? " · a blue ribbon!" : ""}{" "}
      <Button variant="ghost" size="sm" onClick={onReport} data-testid="festival-report-link">
        Festival report
      </Button>
    </p>
  );
}

export function FestivalMap({ state, truck, onServe, onService }: FestivalMapProps) {
  const today = festivalToday(truck, state.calendar.day);
  const festival = today === null ? null : festivalById(today.festivalId);
  return (
    <section
      className="ck-board ck-festival-map"
      aria-labelledby="ck-festival-title"
      data-testid="festival-map"
    >
      <header className="ck-board__header">
        <h2 id="ck-festival-title" className="ck-chalk">
          Festival map
        </h2>
        <span className="ck-board__note">
          {truck.visited.length} of {FESTIVALS.length} festivals · {truck.ribbons.length} ribbons
        </span>
      </header>
      <MapArt truck={truck} today={today?.festivalId ?? null} />
      <p className="ck-muted ck-festival-map__hint">
        Pick a festival. Match its tastes with your three dishes.
      </p>
      <LastFestival truck={truck} onReport={onService} />
      <ul className="ck-festival-week">
        {truck.board.map((slot) => {
          const def = festivalById(slot.festivalId);
          return (
            <li
              key={slot.day}
              className={
                slot.day === state.calendar.day
                  ? "ck-festival-week__day ck-festival-week__day--today"
                  : "ck-festival-week__day"
              }
            >
              <strong>{weekdayName(slot.day)}</strong> {def.name}
              <span className="ck-muted">
                {" "}
                · crowd {def.crowd} · pitch {def.pitchFee}
              </span>
              {def.tags.map((tag) => (
                <TagPill key={tag} tone="next">
                  {tag}
                </TagPill>
              ))}
              {slot.worked ? <span className="ck-good"> Served!</span> : null}
            </li>
          );
        })}
      </ul>
      {state.service !== null ? (
        <Button icon="sparkle" onClick={onService} data-testid="back-to-service">
          Back to the hatch
        </Button>
      ) : festival !== null && today !== null && !today.worked ? (
        <article className="ck-ticket-card" style={{ ["--ck-cuisine" as string]: festival.flag }}>
          <div className="ck-ticket-card__pin" aria-hidden="true" />
          <span className="ad-eyebrow">Today</span>
          <h3 className="ck-ticket-card__title">{festival.name}</h3>
          <p className="ck-muted">{festival.scene}</p>
          <div className="ck-ticket-card__actions">
            <Button icon="sparkle" onClick={onServe} data-testid="serve-festival">
              Drive Clementine there
            </Button>
          </div>
        </article>
      ) : (
        <p className="ck-board__empty">No festival today. Fill the fridge, cook an order or practise.</p>
      )}
    </section>
  );
}
