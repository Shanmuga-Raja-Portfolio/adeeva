export function scrollToPlans(plansId: string): void {
  const target = document.getElementById(plansId);
  if (target === null) return;
  const still =
    document.documentElement.dataset["motion"] === "reduced" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}
