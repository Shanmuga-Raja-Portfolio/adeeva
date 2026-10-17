import { darken, lighten } from "../../../../ui/art/colourMix";
import { CUISINES, type CuisineId } from "../../content/cuisine";
import { cuisineById } from "../../core";
import { CounterTools } from "./counterTools";
import { SchoolCorridor } from "./SchoolCorridor";
import {
  Counter,
  Hood,
  PassLamps,
  PrepFridge,
  Range,
  SceneDefs,
  Shelf,
  TileWall,
  useSceneIds,
  type SceneIds,
} from "./kitchenFixtures";

export const HEADROOM_VIEWBOX = "0 -100 1200 700";

export type BackdropScene = "school" | "hall" | "kitchen" | "counter";

export interface KitchenBackdropProps {
  readonly scene: BackdropScene;
  readonly cuisine?: CuisineId | undefined;
  readonly named?: boolean | undefined;
  readonly headroom?: boolean | undefined;
  readonly className?: string | undefined;
}

function Ceiling({ fill, beam }: { readonly fill: string; readonly beam: string }) {
  return (
    <g>
      <rect y={-150} width={1200} height={150} fill={fill} />
      {[100, 400, 700, 1000].map((x) => (
        <rect key={x} x={x} y={-150} width={22} height={140} fill={beam} opacity={0.55} />
      ))}
      <rect y={-16} width={1200} height={16} fill={beam} />
    </g>
  );
}

function HallScene({ ids, named }: { readonly ids: SceneIds; readonly named: boolean }) {
  return (
    <g>
      <Ceiling fill="#24232b" beam="#3a3346" />
      <rect width={1200} height={600} fill="#2b2a33" />
      <rect width={1200} height={260} fill="#3a3346" opacity={0.6} />
      {[0, 300, 600, 900].map((x) => (
        <path
          key={x}
          d={`M${x} 360 V120 Q${x + 150} -40 ${x + 300} 120 V360`}
          fill="none"
          stroke="#4b4f58"
          strokeWidth={14}
        />
      ))}
      <path d="M0 70 Q300 120 600 70 T1200 70" fill="none" stroke="#1c1b22" strokeWidth={2} />
      {Array.from({ length: 24 }, (_, index) => {
        const x = index * 52 + 10;
        const y = 70 + Math.sin((index / 24) * Math.PI * 4) * 18 + 12;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={6}
            fill="#ffd88a"
            className="ck-twinkle"
            style={{ animationDelay: `${(index % 6) * 0.3}s` }}
          />
        );
      })}
      {CUISINES.map((cuisine, index) => {
        const x = 20 + index * 196;
        return (
          <g key={cuisine.id}>
            <rect x={x} y={250} width={180} height={190} fill={darken(cuisine.wall, 0.25)} />
            <path d={`M${x - 8} 250 L${x + 188} 250 L${x + 176} 206 L${x + 4} 206 Z`} fill={cuisine.accent} />
            {[0, 1, 2, 3, 4].map((stripe) => (
              <path
                key={stripe}
                d={`M${x + 4 + stripe * 36} 206 L${x - 8 + stripe * 39} 250`}
                stroke="#f3f0e8"
                strokeWidth={10}
                opacity={0.35}
              />
            ))}
            <rect x={x} y={250} width={180} height={190} fill={`url(#${ids.lamp})`} opacity={0.35} />
            {named ? (
              <>
                <rect x={x + 26} y={262} width={128} height={30} rx={4} fill="#2e3a40" />
                <text
                  x={x + 90}
                  y={283}
                  textAnchor="middle"
                  fontSize={16}
                  fontWeight={700}
                  fill="#f3f0e8"
                  className="ck-scene-label"
                >
                  {cuisine.counter}
                </text>
              </>
            ) : (
              <g>
                <path
                  d={`M${x + 20} 262 Q${x + 90} 290 ${x + 160} 262`}
                  stroke="#1c1b22"
                  strokeWidth={2}
                  fill="none"
                />
                {[0, 1, 2, 3, 4].map((flag) => (
                  <path
                    key={flag}
                    d={`M${x + 30 + flag * 30} ${266 + Math.sin((flag / 4) * Math.PI) * 12} l10 18 l10 -18 Z`}
                    fill={flag % 2 === 0 ? cuisine.accent : "#f3f0e8"}
                    opacity={0.9}
                  />
                ))}
              </g>
            )}
            <ellipse cx={x + 90} cy={330} rx={60} ry={14} fill={`url(#${ids.lamp})`} />
            <g transform={`translate(${x + 90} 404)`}>
              <ellipse cx={0} cy={22} rx={46} ry={8} fill="#0d1215" opacity={0.35} />
              <path d="M-40 0 L40 0 L34 22 L-34 22 Z" fill={darken(cuisine.accent, 0.2)} />
              <ellipse cx={0} cy={0} rx={40} ry={9} fill={lighten(cuisine.accent, 0.25)} />
              <ellipse cx={0} cy={1} rx={32} ry={6} fill={lighten(cuisine.wall, 0.35)} />
            </g>
            <path
              d={`M${x + 80} 392 c-10 -14 10 -24 0 -38 c-9 -12 9 -22 0 -34 M${x + 100} 392 c-10 -14 10 -24 0 -38 c-9 -12 9 -22 0 -34`}
              stroke="#ffffff"
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
              opacity={0.22}
              className="ck-glory__steam"
              style={{ animationDelay: `${index * 0.4}s` }}
            />
          </g>
        );
      })}
      <Counter ids={ids} y={430} colour="#aeb9bf" edge="#5f6c73" />
    </g>
  );
}

function MainKitchenScene({ ids }: { readonly ids: SceneIds }) {
  return (
    <g>
      <Ceiling fill="#cfd5d3" beam="#8f9a9e" />
      <TileWall ids={ids} x={0} y={0} w={1200} h={440} colour="#e9ece8" grout="#b9c2c4" size={48} />
      <Hood ids={ids} x={330} w={540} />
      <g transform="translate(60 120)">
        <rect width={220} height={170} rx={10} fill="#2f3438" stroke="#8a6a44" strokeWidth={8} />
        <text x={110} y={36} textAnchor="middle" fontSize={22} fill="#f3f0e8" className="ck-chalk">
          Tonight
        </text>
        {[64, 92, 120, 148].map((y, index) => (
          <path
            key={y}
            d={`M26 ${y} h${130 - index * 12}`}
            stroke="#f3f0e8"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}
      </g>
      <g transform="translate(930 110)">
        <rect width={220} height={10} rx={4} fill="#aeb9bf" />
        {[10, 70, 130].map((x, index) => (
          <g key={x} transform={`translate(${x} 10) rotate(${index % 2 === 0 ? -3 : 3})`}>
            <rect width={56} height={90} rx={3} fill="#fbf7ee" />
            <path d="M8 20 h40 M8 34 h30 M8 48 h36" stroke="#2e3a40" strokeWidth={3} opacity={0.6} />
          </g>
        ))}
      </g>
      <Range ids={ids} x={380} w={440} />
      <PrepFridge ids={ids} x={40} />
      <PrepFridge ids={ids} x={1010} />
      <Counter ids={ids} y={500} colour="#c9d1d5" edge="#5f6c73" />
      <PassLamps ids={ids} y={-10} count={4} />
    </g>
  );
}

function CounterScene({ ids, cuisine }: { readonly ids: SceneIds; readonly cuisine: CuisineId }) {
  const def = cuisineById(cuisine);
  const wood = cuisine === "japanese" ? "#e6cfa0" : cuisine === "french" ? "#b9c2c6" : "#aeb9bf";
  return (
    <g>
      <TileWall
        ids={ids}
        x={0}
        y={0}
        w={1200}
        h={500}
        colour={def.wall}
        grout={darken(def.wall, 0.25)}
        size={cuisine === "japanese" ? 120 : 44}
      />
      <Hood ids={ids} x={430} w={340} />
      <Shelf x={850} y={150} w={260} jars={[def.accent, "#f3d23f", "#4f8a3c", "#d9472b", "#f4ecdc"]} />
      <Range ids={ids} x={440} w={320} />
      <PrepFridge ids={ids} x={30} />
      <CounterTools cuisine={cuisine} ids={ids} />
      <Counter ids={ids} y={500} colour={wood} edge={darken(wood, 0.35)} />
      <PassLamps ids={ids} y={-10} count={3} />
    </g>
  );
}

export function KitchenBackdrop({
  scene,
  cuisine = "italian",
  named = true,
  headroom = false,
  className,
}: KitchenBackdropProps) {
  const ids = useSceneIds();
  return (
    <svg
      viewBox={headroom ? HEADROOM_VIEWBOX : "0 0 1200 600"}
      preserveAspectRatio={headroom ? "xMidYMax slice" : "xMidYMid slice"}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs ids={ids} />
      {scene === "school" ? <SchoolCorridor /> : null}
      {scene === "hall" ? <HallScene ids={ids} named={named} /> : null}
      {scene === "kitchen" ? <MainKitchenScene ids={ids} /> : null}
      {scene === "counter" ? <CounterScene ids={ids} cuisine={cuisine} /> : null}
    </svg>
  );
}
