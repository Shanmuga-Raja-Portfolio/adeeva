export function focusHeading(selector = "main h1"): void {
  const heading = document.querySelector<HTMLElement>(selector);
  if (heading === null) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}
