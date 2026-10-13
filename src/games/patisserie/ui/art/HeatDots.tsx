import { HEAT_DOTS } from "../../core";

export interface HeatDotsProps {
  readonly heat: number;
}

export function HeatDots({ heat }: HeatDotsProps) {
  return (
    <span className="pa-heat-dots" role="img" aria-label={`Oven: ${heat} of ${HEAT_DOTS} heat dots`}>
      {Array.from({ length: HEAT_DOTS }, (_, index) => (
        <span
          key={index}
          className={index < heat ? "pa-heat-dots__dot pa-heat-dots__dot--on" : "pa-heat-dots__dot"}
        />
      ))}
    </span>
  );
}
