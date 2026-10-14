import type { ClientPerson } from "./client";

export const TICKET_CLIENTS: readonly ClientPerson[] = [
  {
    id: "theo",
    name: "Theo",
    relation: "The postie whose jacket seam split",
    minReputation: 40,
    look: { skinTone: "chestnut", hairStyle: "short-bob", hairColour: "dark-brown", outfit: "denim-jacket" },
    lines: {
      request: "My jacket seam split on my round. Could you mend it?",
      delighted: "Good as new, and stronger too. Thanks a lot!",
      nearMiss: "It holds! A little wobbly, but it'll do the round.",
    },
  },
  {
    id: "rosa-and-june",
    name: "Rosa & June",
    relation: "Sisters who share one coat",
    minReputation: 44,
    look: { skinTone: "amber", hairStyle: "ponytail", hairColour: "auburn", outfit: "cardigan" },
    lines: {
      request: "Our shared coat's hem frayed in the puddles. A fresh one?",
      delighted: "Neat as a pin. We'll keep taking turns!",
      nearMiss: "Thank you! The new hem wobbles a tiny bit.",
    },
  },
];
