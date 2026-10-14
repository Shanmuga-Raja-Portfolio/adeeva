export const STAGE_LINES = {
  mise: "Drag each ingredient into a bowl. Everything in its place!",
  miseDone: "All in place! Tap Start cooking.",
  pass: "Tap the bell to send it out. Service!",
  quickPass: "Tap Wipe rim, then Service! to send it out.",
  quickPassWiped: "Shiny rim! Tap Service! to send it out.",
} as const;

export function miseInstruction(waiting: number): string {
  return waiting > 0 ? STAGE_LINES.mise : STAGE_LINES.miseDone;
}

export function quickPassInstruction(wiped: boolean): string {
  return wiped ? STAGE_LINES.quickPassWiped : STAGE_LINES.quickPass;
}
