import { useEffect, useState, type RefObject } from "react";

export interface ElementSize {
  readonly width: number;
  readonly height: number;
}

export function useElementSize(ref: RefObject<Element | null>, fallback: ElementSize): ElementSize {
  const [size, setSize] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

export function useElementWidth(ref: RefObject<Element | null>, fallback: number): number {
  return useElementSize(ref, { width: fallback, height: fallback }).width;
}
