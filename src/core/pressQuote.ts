export const PRESS_QUOTE_BANDS: readonly { readonly minScore: number; readonly quote: string }[] = [
  {
    minScore: 85,
    quote: "A collection that made the whole room lean forward. {theme} will be talked about all season.",
  },
  { minScore: 70, quote: "Confident, cohesive and full of charm. {theme} marks a designer worth watching." },
  { minScore: 50, quote: "{theme} has real moments of magic, and a few looks still finding their feet." },
  { minScore: 30, quote: "A brave first step. {theme} shows promise that the next season can polish." },
  { minScore: 0, quote: "{theme} was a learning show, and every great label has one. We'll be back." },
];

export function pressQuote(overall: number, themeName: string): string {
  const band = PRESS_QUOTE_BANDS.find((entry) => overall >= entry.minScore);
  return (band?.quote ?? "").replace("{theme}", themeName);
}
