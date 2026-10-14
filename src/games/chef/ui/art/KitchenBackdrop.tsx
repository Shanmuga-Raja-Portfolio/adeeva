import { darken, lighten } from "../../../../ui/art/colourMix";
import { CUISINES, type CuisineId } from "../../content/cuisine";
import { cuisineById, ghostLayout, lessonDish } from "../../core";
import { PlateGroup } from "./PlateArt";
import { CounterTools } from "./counterTools";
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

export type BackdropScene = "school" | "hall" | "kitchen" | "counter";

export interface KitchenBackdropProps {
  readonly scene: BackdropScene;
  readonly cuisine?: CuisineId | undefined;
  readonly className?: string | undefined;
}

function SchoolScene({ ids }: { readonly ids: SceneIds }) {
  return (
    <g>
      <rect width={1200} height={600} fill="#f3e6cf" />
      <rect y={0} width={1200} height={90} fill="#e9d6b4" />
      {[120, 520, 920].map((x) => (
        <g key={x}>
          <rect x={x} y={20} width={160} height={56} rx={6} fill="#bfe0ef" stroke="#c9a77a" strokeWidth={6} />
          <path d={`M${x + 80} 20 V76 M${x} 48 H${x + 160}`} stroke="#c9a77a" strokeWidth={4} />
        </g>
      ))}
      {CUISINES.map((cuisine, index) => {
        const x = 40 + index * 192;
        return (
          <g key={cuisine.id}>
            <rect x={x} y={150} width={140} height={300} rx={8} fill={cuisine.wallDeep} />
            <rect x={x + 10} y={160} width={120} height={280} rx={4} fill={cuisine.wall} />
            <rect x={x + 22} y={176} width={96} height={74} rx={4} fill={lighten(cuisine.wall, 0.55)} />
            <PlateGroup
              colour="white"
              components={ghostLayout(lessonDish(cuisine.id))}
              transform={`translate(${x + 40} ${180}) scale(0.165)`}
            />
            <circle cx={x + 112} cy={316} r={7} fill="#f2a93b" />
            <rect x={x + 18} y={262} width={104} height={26} rx={4} fill="#f3f0e8" />
            <text
              x={x + 70}
              y={281}
              textAnchor="middle"
              fontSize={15}
              fontWeight={700}
              fill="#2e3a40"
              className="ck-scene-label"
            >
              {cuisine.counter}
            </text>
          </g>
        );
      })}
      <rect x={0} y={450} width={1200} height={150} fill="#c9a77a" />
      {Array.from({ length: 13 }, (_, index) => (
        <path
          key={index}
          d={`M${index * 100} 450 L${index * 100 - 60} 600`}
          stroke="#b08e60"
          strokeWidth={3}
        />
      ))}
      <rect x={0} y={446} width={1200} height={8} fill="#8a6a44" />
      <rect x={-10} y={-10} width={1220} height={620} fill={`url(#${ids.sheen})`} opacity={0.25} />
    </g>
  );
}

function HallScene({ ids }: { readonly ids: SceneIds }) {
  return (
    <g>
      <rect width={1200} height={600} fill="#2b2a33" />
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
            <ellipse cx={x + 90} cy={330} rx={60} ry={14} fill={`url(#${ids.lamp})`} />
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

export function KitchenBackdrop({ scene, cuisine = "italian", className }: KitchenBackdropProps) {
  const ids = useSceneIds();
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs ids={ids} />
      {scene === "school" ? <SchoolScene ids={ids} /> : null}
      {scene === "hall" ? <HallScene ids={ids} /> : null}
      {scene === "kitchen" ? <MainKitchenScene ids={ids} /> : null}
      {scene === "counter" ? <CounterScene ids={ids} cuisine={cuisine} /> : null}
    </svg>
  );
}
