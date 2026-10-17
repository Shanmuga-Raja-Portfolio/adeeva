export interface StatUnitProps {
  readonly value: number;
  readonly unit: string;
}

export function StatUnit({ value, unit }: StatUnitProps) {
  return (
    <>
      {value}
      <span className="ck-unit" aria-hidden="true">
        {unit}
      </span>
    </>
  );
}
