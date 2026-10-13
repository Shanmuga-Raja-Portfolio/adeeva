import type { ReactNode } from "react";
import type { FabricDef } from "../../content/fabric";
import { fabricLook } from "./fabricLook";
import type { FabricLook } from "./fabricLook";
import { seedFromText, seededUnit } from "./seedFromText";

export interface FabricPatternProps {
  id: string;
  fabric: FabricDef;
  tile?: number | undefined;
}

function fabricSheenId(patternId: string): string {
  return `${patternId}-sheen`;
}

export function fabricFill(patternId: string): string {
  return `url(#${patternId})`;
}

export function fabricSheenFill(patternId: string): string {
  return `url(#${fabricSheenId(patternId)})`;
}

function petals(cx: number, cy: number, r: number, colour: string, centre: string, turn: number): ReactNode {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${turn})`}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx={0}
          cy={-r * 0.6}
          rx={r * 0.4}
          ry={r * 0.6}
          fill={colour}
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r={r * 0.28} fill={centre} />
    </g>
  );
}

function leaf(x: number, y: number, angle: number, colour: string): ReactNode {
  return (
    <path
      d="M0 0 C 2 -3 6 -3 8 0 C 6 3 2 3 0 0 Z"
      fill={colour}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

function sparkleStar(x: number, y: number, s: number, colour: string, key: number): ReactNode {
  return (
    <path
      key={key}
      d={`M${x} ${y - s} Q ${x + s * 0.16} ${y - s * 0.16} ${x + s} ${y} Q ${x + s * 0.16} ${y + s * 0.16} ${x} ${y + s} Q ${x - s * 0.16} ${y + s * 0.16} ${x - s} ${y} Q ${x - s * 0.16} ${y - s * 0.16} ${x} ${y - s} Z`}
      fill={colour}
    />
  );
}

interface PrintTile {
  size: number;
  art: ReactNode;
}

function printTile(print: FabricDef["print"], look: FabricLook, seed: number): PrintTile {
  switch (print) {
    case "floral":
      return {
        size: 32,
        art: (
          <>
            {leaf(9, 13, 30, look.leaf)}
            {leaf(2, 5, 200, look.leaf)}
            {leaf(27, 27, -20, look.leaf)}
            {leaf(19, 31, 150, look.leaf)}
            {petals(7, 8, 6, look.motif, look.dark ? "#f2c14e" : "#f6d77c", 10)}
            {petals(23, 24, 5, look.motifSoft, look.dark ? "#f2c14e" : "#fff3d6", 40)}
            {petals(25, 6, 2.6, look.motif, look.glint, 0)}
            {petals(9, 27, 2.4, look.motifSoft, look.glint, 20)}
            <circle cx={17} cy={14} r={0.9} fill={look.motif} />
            <circle cx={3} cy={20} r={0.8} fill={look.motifSoft} />
            <circle cx={30} cy={15} r={0.8} fill={look.motif} />
          </>
        ),
      };
    case "stripe":
      return {
        size: 24,
        art: (
          <>
            <rect x={0} y={0} width={5} height={24} fill={look.motif} opacity={0.92} />
            <rect x={11} y={0} width={1.2} height={24} fill={look.motif} opacity={0.7} />
            <rect x={15} y={0} width={1.2} height={24} fill={look.motif} opacity={0.7} />
          </>
        ),
      };
    case "dot":
      return {
        size: 24,
        art: (
          <>
            <circle cx={6} cy={6} r={2.6} fill={look.motif} />
            <circle cx={18} cy={18} r={2.6} fill={look.motif} />
            <circle cx={5.3} cy={5.2} r={0.8} fill="#ffffff" opacity={0.4} />
            <circle cx={17.3} cy={17.2} r={0.8} fill="#ffffff" opacity={0.4} />
          </>
        ),
      };
    case "check":
      return {
        size: 24,
        art: (
          <>
            <rect x={0} y={0} width={24} height={24} fill="#ffffff" opacity={0.62} />
            <rect x={0} y={0} width={12} height={24} fill={look.base} opacity={0.6} />
            <rect x={0} y={0} width={24} height={12} fill={look.base} opacity={0.6} />
            <rect x={0} y={0} width={12} height={12} fill={look.deep} opacity={0.28} />
            <rect x={17.5} y={0} width={0.8} height={24} fill={look.deep} opacity={0.25} />
            <rect x={0} y={17.5} width={24} height={0.8} fill={look.deep} opacity={0.25} />
          </>
        ),
      };
    case "sparkle": {
      const stars = [0, 1, 2, 3, 4, 5].map((index) => {
        const x = 3 + seededUnit(seed, index * 3) * 18;
        const y = 3 + seededUnit(seed, index * 3 + 1) * 18;
        const size = index < 2 ? 2.4 : 0.9 + seededUnit(seed, index * 3 + 2) * 1.1;
        return sparkleStar(x, y, size, index % 2 === 0 ? look.glint : "#f3d27a", index);
      });
      return {
        size: 24,
        art: (
          <>
            {stars}
            <circle cx={12} cy={4} r={0.5} fill={look.glint} />
            <circle cx={4} cy={17} r={0.45} fill={look.glint} />
            <circle cx={20} cy={13} r={0.45} fill="#f3d27a" />
          </>
        ),
      };
    }
    case "solid":
      return { size: 24, art: null };
  }
}

function weaveTile(look: FabricLook, size: number): ReactNode {
  const lines: ReactNode[] = [];
  switch (look.material.id) {
    case "cotton":
    case "linen": {
      for (let step = 0; step < size; step += 2) {
        lines.push(
          <rect key={`h${step}`} x={0} y={step} width={size} height={0.5} fill="#000000" opacity={0.035} />,
        );
        lines.push(
          <rect key={`v${step}`} x={step} y={0} width={0.5} height={size} fill="#ffffff" opacity={0.05} />,
        );
      }
      if (look.material.id === "linen") {
        lines.push(<rect key="s1" x={2} y={5} width={9} height={0.7} fill="#ffffff" opacity={0.2} />);
        lines.push(<rect key="s2" x={13} y={15} width={7} height={0.6} fill="#000000" opacity={0.08} />);
        lines.push(<rect key="s3" x={4} y={20} width={5} height={0.6} fill="#ffffff" opacity={0.16} />);
      }
      return lines;
    }
    case "denim": {
      for (let step = -size; step < size; step += 3) {
        lines.push(
          <line
            key={step}
            x1={step}
            y1={size}
            x2={step + size}
            y2={0}
            stroke="#e9eef8"
            strokeWidth={0.7}
            opacity={0.16}
          />,
        );
      }
      lines.push(<rect key="fade" x={0} y={0} width={size} height={size} fill="#c8d6ee" opacity={0.05} />);
      return lines;
    }
    case "wool":
      return [0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <circle
          key={index}
          cx={(index * 7.3) % size}
          cy={(index * 11.7) % size}
          r={0.55}
          fill={index % 2 === 0 ? "#ffffff" : "#000000"}
          opacity={0.12}
        />
      ));
    case "tulle": {
      for (let row = 0; row < size; row += 3) {
        for (let col = 0; col < size; col += 3) {
          lines.push(
            <circle
              key={`${row}-${col}`}
              cx={col + (row % 6 === 0 ? 0 : 1.5)}
              cy={row}
              r={1.15}
              fill="none"
              stroke={look.deep}
              strokeWidth={0.25}
              opacity={0.45}
            />,
          );
        }
      }
      return lines;
    }
    case "velvet":
      return <rect x={0} y={0} width={size} height={size} fill={look.deep} opacity={0.12} />;
    case "silk":
    case "satin":
      return null;
  }
}

function sheenStops(look: FabricLook): ReactNode {
  switch (look.material.id) {
    case "satin":
      return (
        <>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="0.28" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity={0.04} />
          <stop offset="0.62" stopColor="#000000" stopOpacity={0.2} />
          <stop offset="0.8" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.18} />
        </>
      );
    case "silk":
      return (
        <>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity={0.32} />
          <stop offset="0.55" stopColor="#000000" stopOpacity={0.1} />
          <stop offset="0.82" stopColor="#ffffff" stopOpacity={0.2} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.12} />
        </>
      );
    case "tulle":
      return (
        <>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.18} />
        </>
      );
    case "denim":
      return (
        <>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.14} />
        </>
      );
    case "velvet":
    case "cotton":
    case "linen":
    case "wool":
      return (
        <>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.08} />
        </>
      );
  }
}

export function FabricPattern({ id, fabric, tile = 24 }: FabricPatternProps) {
  const look = fabricLook(fabric);
  const seed = seedFromText(fabric.id);
  const print = printTile(fabric.print, look, seed);
  const scale = tile / 24;
  const translucent = look.material.id === "tulle";
  return (
    <>
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={print.size}
        height={print.size}
        patternTransform={`scale(${scale})`}
      >
        <rect
          x={0}
          y={0}
          width={print.size}
          height={print.size}
          fill={look.base}
          opacity={translucent ? 0.62 : 1}
        />
        {weaveTile(look, print.size)}
        {print.art}
      </pattern>
      {look.material.id === "velvet" ? (
        <radialGradient id={fabricSheenId(id)} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0.02} />
          <stop offset="0.8" stopColor="#000000" stopOpacity={0.3} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.5} />
        </radialGradient>
      ) : (
        <linearGradient id={fabricSheenId(id)} x1="0" y1="0" x2="1" y2="0.55">
          {sheenStops(look)}
        </linearGradient>
      )}
    </>
  );
}
