import { useSvgId } from "../../../../../ui/art/useSvgId";
import type { AvatarLook } from "../../../../../engine/avatar";
import { FINDS } from "../../../content/find";
import { CLIENTS } from "../../../content/client";
import { FindArt } from "../../art/FindArt";
import { MarketCounter } from "../../art/MarketCounter";
import { MarketDog } from "../../art/MarketDog";
import { OwnStall, OwnStallDefs } from "../../art/OwnStall";
import { Passersby, type Walker } from "../../art/Passersby";
import { SceneFigure } from "../../art/SceneFigure";

export interface TitleStallProps {
  readonly owner: { readonly name: string; readonly look: AvatarLook } | null;
}

const RAIL = ["gingham-shirt", "tea-dress", "faded-jeans", "check-coat"] as const;
const SLOTS = [150, 262, 374, 486];
const STACKS = ["#e57a8f", "#f6d36b", "#8fcfb2", "#7b7fd1", "#f08a3c"];
const SHOPPER = CLIENTS.find((client) => client.id === "nana-bea")?.look;
const WALKERS: readonly Walker[] = [
  { x: 80, y: 300, scale: 0.5, coat: "#9bb7a2", hair: "#3d2516", bag: "#e57a8f", facing: 1 },
  { x: 584, y: 296, scale: 0.46, coat: "#b7a8cf", hair: "#8c3a1e", bag: "#f6d36b", facing: -1 },
];

export function TitleStall({ owner }: TitleStallProps) {
  const id = useSvgId("title-stall");
  return (
    <svg className="tf-title__stall" viewBox="0 0 640 470" aria-hidden="true" focusable="false">
      <defs>
        <OwnStallDefs id={id} />
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#fff6d8" stopOpacity={0.8} />
          <stop offset="1" stopColor="#fff6d8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <Passersby walkers={WALKERS} />
      <ellipse cx={320} cy={452} rx={330} ry={22} fill="#3b2a1c" opacity={0.18} />
      <OwnStall
        id={id}
        sign={owner === null ? "Thrift-Flip" : `${owner.name}'s Flips`}
        left={90}
        right={550}
        floor={430}
        rail={150}
        bareHooks={[]}
      />
      <ellipse cx={320} cy={230} rx={260} ry={150} fill={`url(#${id}-light)`} />
      {RAIL.map((findId, index) => {
        const find = FINDS.find((entry) => entry.id === findId);
        const x = SLOTS[index] ?? 0;
        return find === undefined ? null : (
          <g key={findId} transform={`translate(${x - 52} 130)`}>
            <g className="tf-title__hanger" style={{ animationDelay: `${index * 0.4}s` }}>
              <FindArt find={find} size={104} />
            </g>
          </g>
        );
      })}
      <MarketCounter x={98} y={330} width={444} cloth="#8fcfb2" stacks={STACKS} />
      {SHOPPER === undefined ? null : (
        <SceneFigure
          look={SHOPPER}
          spot={{
            x: 52,
            feet: 456,
            size: 318,
            pose: "carry",
            lean: 2.5,
            flip: false,
            far: false,
            build: 1.12,
            bag: "#e57a8f",
            tilt: 6,
            mood: "delighted",
          }}
          name="A happy shopper"
          delay={0}
        />
      )}
      {owner === null ? null : (
        <SceneFigure
          look={owner.look}
          spot={{
            x: 596,
            feet: 460,
            size: 334,
            pose: "wave",
            lean: -2.5,
            flip: true,
            far: false,
            build: 1.1,
            tilt: -6,
            mood: "delighted",
          }}
          name={owner.name}
          delay={700}
        />
      )}
      <MarketDog x={150} y={462} scale={0.62} />
    </svg>
  );
}
