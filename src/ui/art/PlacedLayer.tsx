import { Fragment, type ReactNode } from "react";

export interface LayeredItem {
  readonly id: string;
  readonly layer: number;
}

export interface PlacedLayerProps<T extends LayeredItem> {
  readonly items: readonly T[];
  readonly className: string;
  readonly render: (item: T) => ReactNode;
}

export function PlacedLayer<T extends LayeredItem>({ items, className, render }: PlacedLayerProps<T>) {
  const ordered = [...items].sort((a, b) => a.layer - b.layer);
  return (
    <g className={className}>
      {ordered.map((item) => (
        <Fragment key={item.id}>{render(item)}</Fragment>
      ))}
    </g>
  );
}
