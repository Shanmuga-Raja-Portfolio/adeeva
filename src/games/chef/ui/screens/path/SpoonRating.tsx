export function SpoonRating({ spoons }: { readonly spoons: number }) {
  return (
    <span className="ck-spoons" role="img" aria-label={`${spoons} of 5 spoons`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <svg key={index} viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
          <ellipse
            cx={12}
            cy={7}
            rx={5}
            ry={6}
            fill={index <= spoons ? "#f2a93b" : "none"}
            stroke={index <= spoons ? "#c47f1a" : "#aeb9bf"}
            strokeWidth={2}
          />
          <path
            d="M12 13 V22"
            stroke={index <= spoons ? "#c47f1a" : "#aeb9bf"}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>
      ))}
    </span>
  );
}
