export interface ShopSignProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export function ShopSign({ x, y, scale }: ShopSignProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-20 -60 V-30 M20 -60 V-30" stroke="#6b4232" strokeWidth={3} />
      <rect
        x={-130}
        y={-34}
        width={260}
        height={74}
        rx={16}
        fill="#4b5aa6"
        stroke="#2f3a78"
        strokeWidth={4}
      />
      <rect x={-122} y={-26} width={244} height={58} rx={11} fill="none" stroke="#e2b93b" strokeWidth={2} />
      <text
        x={14}
        y={10}
        textAnchor="middle"
        fontFamily='"Bookman Old Style", Georgia, serif'
        fontSize={25}
        fontWeight={700}
        fill="#fff1cf"
      >
        Crumb &amp; Comet
      </text>
      <g transform="translate(-108 2) scale(0.8)">
        <path d="M0 -16 A16 16 0 1 0 11 12 A12 12 0 1 1 0 -16 Z" fill="#e2b93b" />
        <path
          d="M14 -16 l2 4.2 4.6 0.6 -3.3 3.2 0.8 4.6 -4.1 -2.2 -4.1 2.2 0.8 -4.6 -3.3 -3.2 4.6 -0.6 Z"
          fill="#fff1cf"
        />
      </g>
    </g>
  );
}
