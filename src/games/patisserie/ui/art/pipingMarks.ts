export interface Ellipse {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

function point(ellipse: Ellipse, theta: number): [number, number] {
  return [ellipse.cx + ellipse.rx * Math.cos(theta), ellipse.cy + ellipse.ry * Math.sin(theta)];
}

export function frontAngles(count: number): number[] {
  return Array.from({ length: count }, (_, index) => Math.PI - (Math.PI * (index + 0.5)) / count);
}

export function scallops(ellipse: Ellipse, count: number, depth: number): string {
  const parts: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const from = Math.PI - (Math.PI * index) / count;
    const to = Math.PI - (Math.PI * (index + 1)) / count;
    const [x1, y1] = point(ellipse, from);
    const [x2, y2] = point(ellipse, to);
    const [mx, my] = point(ellipse, (from + to) / 2);
    if (index === 0) parts.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}`);
    parts.push(`Q${mx.toFixed(1)} ${(my + depth).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return parts.join(" ");
}

export function rope(ellipse: Ellipse, count: number, size: number): string {
  return frontAngles(count)
    .map((theta) => {
      const [x, y] = point(ellipse, theta);
      return `M${(x - size).toFixed(1)} ${(y + size * 0.5).toFixed(1)} q${size} ${-size * 1.4} ${size * 2} 0`;
    })
    .join(" ");
}

export function dots(ellipse: Ellipse, count: number): [number, number][] {
  return frontAngles(count).map((theta) => point(ellipse, theta));
}
