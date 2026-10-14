export const GUEST_NOTE_BANDS = ["glowing", "happy", "gentle"] as const;
export type GuestNoteBand = (typeof GUEST_NOTE_BANDS)[number];

export const GUEST_NOTES: Readonly<Record<GuestNoteBand, readonly string[]>> = {
  glowing: [
    "We came for one plate and stayed for three. Thank you!",
    "My grandad said it tasted like his best birthday.",
    "Everything arrived warm and smelling wonderful.",
    "We'll be back next week with the whole family.",
  ],
  happy: [
    "A lovely evening. The food was cosy and kind.",
    "Our table shared everything. Delicious!",
    "Friendly faces and a warm meal. Just right.",
    "The colours on the plate made us smile.",
  ],
  gentle: [
    "A calm, friendly visit. We'll try more dishes soon.",
    "Thank you for looking after us on a busy night.",
    "Good food and a patient team. See you again.",
    "We liked the menu. Excited to come back.",
  ],
};
