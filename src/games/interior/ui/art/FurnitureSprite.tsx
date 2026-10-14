import { darken, lighten } from "../../../../ui/art/colourMix";
import type { FurnitureId } from "../../content/furniture";

interface FurnitureSpriteProps {
  readonly furnitureId: FurnitureId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly unit: number;
  readonly fill: string;
  readonly soft: string;
}

const INK = "#3b2a33";

interface Box {
  readonly w: number;
  readonly u: number;
  readonly fill: string;
  readonly soft: string;
  readonly line: number;
}

function Legs({ w, h, u, line }: { w: number; h: number; u: number; line: number }) {
  const leg = Math.max(2, u * 0.06);
  return (
    <g fill={darken("#8a6a4a", 0.2)} stroke={INK} strokeWidth={line * 0.6}>
      <rect x={-w / 2 + leg} y={-h} width={leg} height={h} rx={leg / 3} />
      <rect x={w / 2 - leg * 2} y={-h} width={leg} height={h} rx={leg / 3} />
    </g>
  );
}

function Bed({ w, u, fill, soft, line }: Box) {
  const h = u * 0.95;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={u * 0.18}
        height={h}
        rx={u * 0.06}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2}
        y={-h * 0.48}
        width={w}
        height={h * 0.32}
        rx={u * 0.08}
        fill={lighten(fill, 0.25)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.2}
        y={-h * 0.66}
        width={u * 0.42}
        height={h * 0.2}
        rx={u * 0.1}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <path
        d={`M${-w / 2 + u * 0.5} ${-h * 0.5} Q${0} ${-h * 0.62} ${w / 2 - u * 0.04} ${-h * 0.5} L${w / 2 - u * 0.04} ${-h * 0.18} L${-w / 2 + u * 0.5} ${-h * 0.18} Z`}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-w / 2 + u * 0.7} ${-h * 0.4} L${w / 2 - u * 0.2} ${-h * 0.4}`}
        stroke={lighten(soft, 0.4)}
        strokeWidth={line * 1.4}
        strokeLinecap="round"
      />
      <Legs w={w} h={h * 0.16} u={u} line={line} />
    </g>
  );
}

function Bunk({ w, u, fill, soft, line }: Box) {
  const h = u * 2.3;
  const post = u * 0.12;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={post}
        height={h}
        rx={post / 3}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={w / 2 - post}
        y={-h}
        width={post}
        height={h}
        rx={post / 3}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      {[0.32, 0.86].map((level) => (
        <g key={level}>
          <rect
            x={-w / 2 + post}
            y={-h * level}
            width={w - 2 * post}
            height={u * 0.22}
            fill={lighten(fill, 0.2)}
            stroke={INK}
            strokeWidth={line}
          />
          <rect
            x={-w / 2 + post}
            y={-h * level - u * 0.2}
            width={w - 2 * post}
            height={u * 0.22}
            rx={u * 0.08}
            fill={soft}
            stroke={INK}
            strokeWidth={line * 0.8}
          />
        </g>
      ))}
      <rect
        x={-w / 2 + post}
        y={-h * 0.99}
        width={w - 2 * post}
        height={u * 0.1}
        fill={fill}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <g stroke={darken(fill, 0.25)} strokeWidth={line * 1.3} strokeLinecap="round">
        <path
          d={`M${w / 2 - u * 0.5} ${-h * 0.1} L${w / 2 - u * 0.5} ${-h * 0.8} M${w / 2 - u * 0.2} ${-h * 0.1} L${w / 2 - u * 0.2} ${-h * 0.8}`}
        />
        {[0.25, 0.42, 0.59, 0.76].map((rung) => (
          <path key={rung} d={`M${w / 2 - u * 0.5} ${-h * rung} L${w / 2 - u * 0.2} ${-h * rung}`} />
        ))}
      </g>
    </g>
  );
}

function Desk({ w, u, fill, line }: Box) {
  const h = u * 0.9;
  return (
    <g>
      <Legs w={w} h={h * 0.88} u={u} line={line} />
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={u * 0.14}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={w / 2 - u * 0.62}
        y={-h + u * 0.14}
        width={u * 0.56}
        height={u * 0.3}
        fill={lighten(fill, 0.15)}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <circle cx={w / 2 - u * 0.34} cy={-h + u * 0.29} r={u * 0.035} fill={INK} />
      <rect
        x={-w / 2 + u * 0.24}
        y={-h - u * 0.22}
        width={u * 0.3}
        height={u * 0.22}
        rx={u * 0.03}
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={line * 0.6}
      />
    </g>
  );
}

function Chair({ w, u, fill, line }: Box) {
  const h = u * 0.95;
  const seat = Math.min(w, u * 0.62);
  return (
    <g>
      <rect
        x={-seat / 2}
        y={-h}
        width={seat}
        height={h * 0.5}
        rx={u * 0.12}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-seat / 2 - u * 0.04}
        y={-h * 0.5}
        width={seat + u * 0.08}
        height={u * 0.12}
        rx={u * 0.05}
        fill={lighten(fill, 0.2)}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M0 ${-h * 0.4} L0 ${-u * 0.1} M${-seat / 2} 0 L${seat / 2} 0`}
        stroke={INK}
        strokeWidth={line * 1.4}
        strokeLinecap="round"
      />
    </g>
  );
}

function Wardrobe({ w, u, fill, line }: Box) {
  const h = u * 2.2;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.08}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 - u * 0.04}
        y={-h - u * 0.08}
        width={w + u * 0.08}
        height={u * 0.14}
        rx={u * 0.04}
        fill={darken(fill, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      <path d={`M0 ${-h + u * 0.12} L0 ${-u * 0.12}`} stroke={INK} strokeWidth={line} />
      <rect
        x={-w / 2 + u * 0.14}
        y={-h + u * 0.2}
        width={w / 2 - u * 0.24}
        height={h - u * 0.5}
        rx={u * 0.06}
        fill={lighten(fill, 0.12)}
        stroke={darken(fill, 0.25)}
        strokeWidth={line * 0.6}
      />
      <rect
        x={u * 0.1}
        y={-h + u * 0.2}
        width={w / 2 - u * 0.24}
        height={h - u * 0.5}
        rx={u * 0.06}
        fill={lighten(fill, 0.12)}
        stroke={darken(fill, 0.25)}
        strokeWidth={line * 0.6}
      />
      <circle cx={-u * 0.1} cy={-h * 0.5} r={u * 0.04} fill="#e8c46a" stroke={INK} strokeWidth={line * 0.5} />
      <circle cx={u * 0.1} cy={-h * 0.5} r={u * 0.04} fill="#e8c46a" stroke={INK} strokeWidth={line * 0.5} />
    </g>
  );
}

const SPINES = ["#d0587e", "#2a8c91", "#d9a42b", "#22305a", "#9cb59a", "#f07f63", "#b9a7dc"];

function Bookcase({ w, u, fill, line }: Box) {
  const h = u * 2.1;
  const shelves = [0.25, 0.5, 0.75];
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.06}
        fill={darken(fill, 0.25)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.08}
        y={-h + u * 0.08}
        width={w - u * 0.16}
        height={h - u * 0.16}
        fill={darken(fill, 0.45)}
      />
      {shelves.map((shelf, row) => (
        <g key={shelf}>
          {Array.from({ length: Math.max(3, Math.floor(w / (u * 0.16))) - 1 }, (_, index) => {
            const width = u * (0.1 + ((index + row) % 3) * 0.02);
            const height = u * (0.32 + ((index * 3 + row) % 4) * 0.04);
            const x = -w / 2 + u * 0.12 + index * u * 0.16;
            if (x + width > w / 2 - u * 0.1) return null;
            return (
              <rect
                key={index}
                x={x}
                y={-h * (1 - shelf) - height}
                width={width}
                height={height}
                rx={u * 0.02}
                fill={SPINES[(index + row * 2) % SPINES.length]}
                stroke={INK}
                strokeWidth={line * 0.4}
              />
            );
          })}
          <rect
            x={-w / 2 + u * 0.06}
            y={-h * (1 - shelf)}
            width={w - u * 0.12}
            height={u * 0.07}
            fill={fill}
            stroke={INK}
            strokeWidth={line * 0.5}
          />
        </g>
      ))}
    </g>
  );
}

function Sofa({ w, u, soft, line }: Box) {
  const h = u * 1.05;
  const arm = u * 0.32;
  return (
    <g>
      <rect
        x={-w / 2 + arm * 0.6}
        y={-h}
        width={w - arm * 1.2}
        height={h * 0.62}
        rx={u * 0.2}
        fill={darken(soft, 0.08)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2}
        y={-h * 0.58}
        width={arm}
        height={h * 0.5}
        rx={u * 0.14}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={w / 2 - arm}
        y={-h * 0.58}
        width={arm}
        height={h * 0.5}
        rx={u * 0.14}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + arm * 0.8}
        y={-h * 0.42}
        width={w - arm * 1.6}
        height={h * 0.3}
        rx={u * 0.12}
        fill={lighten(soft, 0.18)}
        stroke={INK}
        strokeWidth={line}
      />
      <path d={`M0 ${-h * 0.4} L0 ${-h * 0.14}`} stroke={darken(soft, 0.2)} strokeWidth={line} />
      <Legs w={w - arm * 0.6} h={h * 0.1} u={u} line={line} />
    </g>
  );
}

function Armchair({ w, u, soft, line }: Box) {
  return <Sofa w={w} u={u} soft={soft} fill={soft} line={line} />;
}

function CoffeeTable({ w, u, fill, line }: Box) {
  const h = u * 0.45;
  return (
    <g>
      <Legs w={w * 0.9} h={h} u={u} line={line} />
      <rect
        x={-w / 2}
        y={-h - u * 0.1}
        width={w}
        height={u * 0.13}
        rx={u * 0.05}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <ellipse
        cx={-w * 0.18}
        cy={-h - u * 0.14}
        rx={u * 0.12}
        ry={u * 0.04}
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={w * 0.05}
        y={-h - u * 0.26}
        width={u * 0.1}
        height={u * 0.14}
        rx={u * 0.03}
        fill="#f07f63"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
    </g>
  );
}

function DiningTable({ w, u, fill, line }: Box) {
  const h = u * 0.85;
  const chair = (side: number) => (
    <g transform={`translate(${side * (w / 2 - u * 0.1)} 0)`}>
      <rect
        x={-u * 0.14}
        y={-h * 1.1}
        width={u * 0.28}
        height={h * 0.6}
        rx={u * 0.08}
        fill={lighten(fill, 0.1)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-u * 0.2}
        y={-h * 0.52}
        width={u * 0.4}
        height={u * 0.1}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-u * 0.16} ${-h * 0.42} L${-u * 0.16} 0 M${u * 0.16} ${-h * 0.42} L${u * 0.16} 0`}
        stroke={INK}
        strokeWidth={line * 1.2}
      />
    </g>
  );
  return (
    <g>
      {chair(-1)}
      {chair(1)}
      <path
        d={`M0 ${-h} L0 0 M${-u * 0.3} 0 L${u * 0.3} 0`}
        stroke={INK}
        strokeWidth={line * 2.2}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-h} rx={w / 2 - u * 0.3} ry={u * 0.1} fill={fill} stroke={INK} strokeWidth={line} />
      <circle cx={0} cy={-h - u * 0.16} r={u * 0.09} fill="#f6d77a" stroke={INK} strokeWidth={line * 0.5} />
    </g>
  );
}

function ToyBox({ w, u, fill, line }: Box) {
  const h = u * 0.6;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.08}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 - u * 0.04}
        y={-h - u * 0.1}
        width={w + u * 0.08}
        height={u * 0.16}
        rx={u * 0.06}
        fill={darken(fill, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M0 ${-h * 0.75} l${u * 0.06} ${u * 0.12} l${u * 0.13} ${u * 0.02} l${-u * 0.1} ${u * 0.09} l${u * 0.03} ${u * 0.13} l${-u * 0.12} ${-u * 0.07} l${-u * 0.12} ${u * 0.07} l${u * 0.03} ${-u * 0.13} l${-u * 0.1} ${-u * 0.09} l${u * 0.13} ${-u * 0.02} Z`}
        fill="#f6d77a"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <circle
        cx={-w * 0.32}
        cy={-h - u * 0.2}
        r={u * 0.1}
        fill="#9fd0ee"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
    </g>
  );
}

function WindowSeat({ w, u, soft, fill, line }: Box) {
  const h = u * 0.6;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.06}
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.12}
        y={-h + u * 0.2}
        width={w / 3 - u * 0.2}
        height={h - u * 0.3}
        rx={u * 0.04}
        fill={lighten(fill, 0.5)}
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={w / 6 + u * 0.08}
        y={-h + u * 0.2}
        width={w / 3 - u * 0.2}
        height={h - u * 0.3}
        rx={u * 0.04}
        fill={lighten(fill, 0.5)}
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={-w / 2 + u * 0.04}
        y={-h - u * 0.16}
        width={w - u * 0.08}
        height={u * 0.2}
        rx={u * 0.1}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <ellipse
        cx={-w * 0.28}
        cy={-h - u * 0.26}
        rx={u * 0.18}
        ry={u * 0.14}
        fill={lighten(soft, 0.3)}
        stroke={INK}
        strokeWidth={line * 0.7}
      />
    </g>
  );
}

export function FurnitureSprite({ furnitureId, x, y, width, unit, fill, soft }: FurnitureSpriteProps) {
  const box: Box = { w: width, u: unit, fill, soft, line: Math.max(1, unit * 0.035) };
  const body = (() => {
    switch (furnitureId) {
      case "single-bed":
        return <Bed {...box} />;
      case "bunk-bed":
        return <Bunk {...box} />;
      case "desk":
        return <Desk {...box} />;
      case "desk-chair":
        return <Chair {...box} />;
      case "wardrobe":
        return <Wardrobe {...box} />;
      case "bookcase":
        return <Bookcase {...box} />;
      case "sofa":
        return <Sofa {...box} />;
      case "armchair":
        return <Armchair {...box} />;
      case "coffee-table":
        return <CoffeeTable {...box} />;
      case "dining-table":
        return <DiningTable {...box} />;
      case "toy-box":
        return <ToyBox {...box} />;
      case "window-seat":
        return <WindowSeat {...box} />;
    }
  })();
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <ellipse cx={0} cy={0} rx={width * 0.52} ry={unit * 0.12} fill="#2b2230" opacity={0.16} />
      {body}
    </g>
  );
}
