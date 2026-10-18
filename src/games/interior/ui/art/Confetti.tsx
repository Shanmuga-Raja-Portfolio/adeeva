import type { CSSProperties } from "react";

const COLOURS = [
  "#c8664a",
  "#f6d77a",
  "#3c6aa8",
  "#7d8a4a",
  "#b9a7dc",
  "#f2a0ae",
  "#2a8c91",
  "#ffd95a",
] as const;
const SHAPES = ["strip", "round", "star", "strip", "ribbon", "round"] as const;

const PIECES = Array.from({ length: 84 }, (_, index) => ({
  left: ((index * 37 + (index % 7) * 13) % 104) - 2,
  delay: (index % 12) * 0.08,
  colour: COLOURS[index % COLOURS.length] ?? "#c8664a",
  turn: (index * 53) % 360,
  drop: 40 + ((index * 97) % 600),
  spin: 180 + ((index * 47) % 360),
  size: 9 + (index % 4) * 3,
  shape: SHAPES[index % SHAPES.length] ?? "strip",
}));

export function Confetti() {
  return (
    <div className="is-confetti" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className={`is-confetti__piece is-confetti__piece--${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            width: `${piece.shape === "strip" ? piece.size * 0.7 : piece.size * 1.3}px`,
            height: `${piece.shape === "strip" ? piece.size * 1.6 : piece.shape === "ribbon" ? piece.size * 0.6 : piece.size * 1.3}px`,
            animationDelay: `${piece.delay}s`,
            color: piece.colour,
            rotate: `${piece.turn}deg`,
            ...({ "--drop": `${piece.drop}px`, "--spin": `${piece.spin}deg` } as CSSProperties),
          }}
        />
      ))}
    </div>
  );
}
