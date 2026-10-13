export interface SvgPoint {
  readonly x: number;
  readonly y: number;
}

export function clientToSvg(svg: SVGSVGElement | null, clientX: number, clientY: number): SvgPoint | null {
  if (svg === null) return null;
  const matrix = svg.getScreenCTM();
  if (matrix === null) return null;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}

export function isInsideElement(element: Element | null, clientX: number, clientY: number): boolean {
  if (element === null) return false;
  const rect = element.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}
