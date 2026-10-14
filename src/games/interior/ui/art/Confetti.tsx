const PIECES = Array.from({ length: 28 }, (_, index) => ({
  left: (index * 37) % 100,
  delay: (index % 7) * 0.12,
  colour: ["#c8664a", "#f6d77a", "#3c6aa8", "#7d8a4a", "#b9a7dc", "#f2c4c9"][index % 6] ?? "#c8664a",
  turn: (index * 53) % 360,
}));

export function Confetti() {
  return (
    <div className="is-confetti" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="is-confetti__piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            background: piece.colour,
            rotate: `${piece.turn}deg`,
          }}
        />
      ))}
    </div>
  );
}
