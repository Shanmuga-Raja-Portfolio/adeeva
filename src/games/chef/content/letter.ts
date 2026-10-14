export interface LetterDef {
  readonly id: string;
  readonly from: string;
  readonly text: string;
}

export const LETTERS: readonly LetterDef[] = [
  { id: "letter-soup", from: "Pip, age 8", text: "My aunt and me tasted as we went. Our soup was good!" },
  {
    id: "letter-grandad",
    from: "Rania, age 10",
    text: "Your 'taste as you go' tip helped me make soup with my grandad.",
  },
  {
    id: "letter-bowls",
    from: "Theo, age 9",
    text: "Mum and I put everything in little bowls first, just like you. So tidy!",
  },
  {
    id: "letter-lime",
    from: "Ines, age 12",
    text: "Dad let me add the lime when we cooked. It was the best bit.",
  },
  {
    id: "letter-rim",
    from: "Kofi, age 11",
    text: "I helped Gran cook lunch and wiped the plate rim before we ate. She clapped!",
  },
  {
    id: "letter-stir",
    from: "Mei, age 9",
    text: "My big sister held the pot and I stirred slow circles. It worked!",
  },
  {
    id: "letter-share",
    from: "Sami, age 13",
    text: "Uncle Ade and I cooked for our street party. Everyone wanted more.",
  },
  {
    id: "letter-picture",
    from: "Lottie, age 8",
    text: "I drew your plate and Nana helped me cook it for real.",
  },
];
