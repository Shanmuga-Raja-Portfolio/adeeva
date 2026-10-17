import type { CSSProperties } from "react";

const COLOURS = ["#c8664a", "#f6d77a", "#3c6aa8", "#7d8a4a", "#b9a7dc", "#f2a0ae", "#2a8c91"] as const;

const PIECES = Array.from({ length: 52 }, (_, index) => ({
  left: (index * 37 + (index % 3) * 11) % 100,
  delay: (index % 9) * 0.1,
  colour: COLOURS[index % COLOURS.length] ?? "#c8664a",
  turn: (index * 53) % 360,
  drop: 50 + ((index * 97) % 520),
  spin: 180 + ((index * 47) % 360),
  width: 8 + (index % 4) * 2,
  height: 14 + (index % 3) * 4,
  round: index % 5 === 0,
}));

export function Confetti() {
  return (
    <div className="is-confetti" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className={piece.round ? "is-confetti__piece is-confetti__piece--round" : "is-confetti__piece"}
          style={{
            left: `${piece.left}%`,
            width: `${piece.width}px`,
            height: `${piece.round ? piece.width : piece.height}px`,
            animationDelay: `${piece.delay}s`,
            background: piece.colour,
            rotate: `${piece.turn}deg`,
            ...({ "--drop": `${piece.drop}px`, "--spin": `${piece.spin}deg` } as CSSProperties),
          }}
        />
      ))}
    </div>
  );
}
