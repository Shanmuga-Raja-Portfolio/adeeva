import { createElement, lazy, useState, type ComponentType } from "react";

export interface LazyScreen<P extends object> {
  readonly Screen: ComponentType<P>;
  readonly preload: () => Promise<ComponentType<P>>;
}

export function lazyScreen<P extends object>(load: () => Promise<ComponentType<P>>): LazyScreen<P> {
  let loaded: ComponentType<P> | null = null;
  let pending: Promise<ComponentType<P>> | null = null;
  const preload = () => {
    pending ??= load().then(
      (component) => {
        loaded = component;
        return component;
      },
      (error: unknown) => {
        pending = null;
        throw error;
      },
    );
    return pending;
  };
  const Deferred = lazy(() => preload().then((component) => ({ default: component })));
  function Screen(props: P) {
    const [component] = useState<ComponentType<P>>(() => loaded ?? Deferred);
    return createElement(component, props);
  }
  return { Screen, preload };
}
