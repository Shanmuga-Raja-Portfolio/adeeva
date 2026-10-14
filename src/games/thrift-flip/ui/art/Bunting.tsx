export interface BuntingProps {
  readonly className?: string | undefined;
}

const FLAG_COLOURS = ["#f08a3c", "#8fcfb2", "#3f5d84", "#f6d36b", "#e57a8f"];

export function Bunting({ className }: BuntingProps) {
  return (
    <svg
      className={className ? `tf-bunting ${className}` : "tf-bunting"}
      viewBox="0 0 600 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 4 Q300 22 600 4" fill="none" stroke="#a07a52" strokeWidth={1.6} />
      {Array.from({ length: 14 }, (_, index) => {
        const x = 8 + index * 42;
        const t = x / 600;
        const y = 4 + Math.sin(t * Math.PI) * 16;
        return (
          <path
            key={x}
            d={`M${x} ${y} L${x + 28} ${y + 1} L${x + 14} ${y + 22} Z`}
            fill={FLAG_COLOURS[index % FLAG_COLOURS.length]}
          />
        );
      })}
    </svg>
  );
}
