interface CelebrationBurstProps {
  readonly active: boolean;
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export function CelebrationBurst({ active }: CelebrationBurstProps) {
  if (!active) return null;
  return (
    <svg className="jb-burst" viewBox="-100 -100 200 200" aria-hidden="true">
      {RAYS.map((angle, index) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path
            className="jb-burst__glint"
            style={{ animationDelay: `${index * 25}ms` }}
            d="M0 -58 Q3 -50 10 -48 Q3 -46 0 -38 Q-3 -46 -10 -48 Q-3 -50 0 -58 Z"
            fill={index % 2 === 0 ? "#f8d27a" : "#ffffff"}
          />
        </g>
      ))}
    </svg>
  );
}
