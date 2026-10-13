import type { AvatarLook } from "../../../engine/avatar";
import type { CareerId } from "./career";
import type { ColourId, MaterialId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { TraitId } from "../../../engine/trait";
import type { TrimId } from "./trim";

export interface TrimRequirement {
  trim: TrimId;
  count: number;
}

export interface BriefTemplate {
  occasion: string;
  requiredTags: readonly StyleTag[];
  favouredColours: readonly ColourId[];
  avoidColours: readonly ColourId[];
  avoidMaterials: readonly MaterialId[];
  requiredTrims: readonly TrimRequirement[];
  budget: readonly [number, number];
  fee: readonly [number, number];
  deadlineDays: readonly [number, number];
  minQuality: number;
}

export interface ClientLines {
  request: string;
  delighted: string;
  nearMiss: string;
}

export interface ClientDef {
  id: string;
  name: string;
  relation: string;
  careers: readonly CareerId[];
  traitGate?: TraitId;
  minReputation: number;
  look: AvatarLook;
  brief: BriefTemplate;
  lines: ClientLines;
}

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "mom",
    name: "Mom",
    relation: "Your biggest fan",
    careers: ["student"],
    minReputation: 0,
    look: { skinTone: "honey", hairStyle: "high-bun", hairColour: "dark-brown", outfit: "cardigan" },
    brief: {
      occasion: "Birthday dinner",
      requiredTags: ["elegant"],
      favouredColours: ["navy", "teal", "ivory"],
      avoidColours: ["black"],
      avoidMaterials: ["denim"],
      requiredTrims: [{ trim: "button", count: 2 }],
      budget: [60, 90],
      fee: [50, 70],
      deadlineDays: [4, 6],
      minQuality: 60,
    },
    lines: {
      request:
        "My birthday dinner is coming up and I would love to wear something made by you. Something graceful?",
      delighted: "Oh, sweetheart. I am never taking this off. Everyone at the table asked who made it!",
      nearMiss: "I love that you made this for me. Maybe next time we can tidy a few details together.",
    },
  },
  {
    id: "priya",
    name: "Priya",
    relation: "Best friend",
    careers: ["student"],
    minReputation: 0,
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "black", outfit: "denim-jacket" },
    brief: {
      occasion: "Winter formal",
      requiredTags: ["romantic"],
      favouredColours: ["rose", "blush", "lavender"],
      avoidColours: ["mustard"],
      avoidMaterials: [],
      requiredTrims: [{ trim: "bow", count: 1 }],
      budget: [70, 110],
      fee: [60, 85],
      deadlineDays: [5, 7],
      minQuality: 62,
    },
    lines: {
      request:
        "Winter formal is in a week and nothing in the shops feels like me. Help? Think soft, pretty, a little dramatic.",
      delighted: "I spun around so many times I got dizzy. This is the best dress I have ever owned!",
      nearMiss:
        "It's lovely, honestly. A couple of bits feel a little off, but I'm still wearing it with pride.",
    },
  },
  {
    id: "sam",
    name: "Sam",
    relation: "Cousin Leo's partner",
    careers: ["student"],
    minReputation: 3,
    look: { skinTone: "porcelain", hairStyle: "pixie", hairColour: "auburn", outfit: "blazer" },
    brief: {
      occasion: "Graduation ceremony",
      requiredTags: ["classic"],
      favouredColours: ["sage", "ivory", "sky"],
      avoidColours: ["ruby"],
      avoidMaterials: ["tulle"],
      requiredTrims: [{ trim: "ribbon-belt", count: 1 }],
      budget: [70, 100],
      fee: [65, 90],
      deadlineDays: [5, 7],
      minQuality: 65,
    },
    lines: {
      request:
        "Leo says you're brilliant. I graduate soon and want something timeless I can wear again and again.",
      delighted: "Classic, comfortable and so me. The photos are going to be perfect.",
      nearMiss: "Thank you for this. It's close to what I imagined; a few details didn't quite land.",
    },
  },
  {
    id: "mrs-chen",
    name: "Mrs. Chen",
    relation: "Neighbour with the best garden",
    careers: ["student"],
    minReputation: 5,
    look: { skinTone: "peach", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
    brief: {
      occasion: "Garden party",
      requiredTags: ["playful"],
      favouredColours: ["mustard", "sky", "blush", "sage"],
      avoidColours: ["black", "charcoal"],
      avoidMaterials: ["velvet"],
      requiredTrims: [{ trim: "flower-applique", count: 2 }],
      budget: [60, 95],
      fee: [60, 80],
      deadlineDays: [4, 6],
      minQuality: 62,
    },
    lines: {
      request:
        "My roses are blooming and I am hosting the whole street. I'd like a dress as cheerful as the garden!",
      delighted: "The bees will be jealous! You have a real gift, dear.",
      nearMiss: "Thank you, dear. It's charming, even if a few things aren't quite how I pictured them.",
    },
  },
  {
    id: "tomas",
    name: "Tomas",
    relation: "Classmate, plays bass",
    careers: ["student"],
    minReputation: 8,
    look: { skinTone: "chestnut", hairStyle: "locs", hairColour: "black", outfit: "denim-jacket" },
    brief: {
      occasion: "Band's first real gig, for his bandmate Ana",
      requiredTags: ["edgy"],
      favouredColours: ["black", "charcoal", "ruby"],
      avoidColours: ["blush", "sky"],
      avoidMaterials: ["tulle"],
      requiredTrims: [{ trim: "sequin-patch", count: 2 }],
      budget: [70, 110],
      fee: [70, 95],
      deadlineDays: [3, 5],
      minQuality: 66,
    },
    lines: {
      request:
        "Our singer Ana needs a stage look that's all attitude for our first proper gig. Can you make it shine?",
      delighted: "Ana walked on stage and the whole room went quiet. Then it went wild. Legend.",
      nearMiss: "It works, it's good. A bit less stage-ready than we hoped, but thank you.",
    },
  },
  {
    id: "iris",
    name: "Iris",
    relation: "Painter from art club",
    careers: ["student", "label"],
    traitGate: "dreamer",
    minReputation: 4,
    look: { skinTone: "sand", hairStyle: "curly-puff", hairColour: "lilac", outfit: "studio-apron" },
    brief: {
      occasion: "Her first gallery opening",
      requiredTags: ["dreamy", "bold"],
      favouredColours: ["lavender", "teal", "gold", "coral"],
      avoidColours: ["charcoal"],
      avoidMaterials: ["denim"],
      requiredTrims: [{ trim: "star-applique", count: 2 }],
      budget: [90, 140],
      fee: [90, 120],
      deadlineDays: [5, 8],
      minQuality: 66,
    },
    lines: {
      request:
        "I want to look like one of my paintings walking around. Colour everywhere. Can you dream it with me?",
      delighted: "People kept asking if the dress was part of the exhibition. It is now.",
      nearMiss: "The idea is beautiful. I think the dress was still waking up, but I love that we tried.",
    },
  },
  {
    id: "aunt-odile",
    name: "Aunt Odile",
    relation: "Retired tailor, sharp eyes",
    careers: ["student", "label"],
    traitGate: "perfectionist",
    minReputation: 6,
    look: { skinTone: "cocoa", hairStyle: "high-bun", hairColour: "platinum", outfit: "blazer" },
    brief: {
      occasion: "Concert recital",
      requiredTags: ["elegant", "classic"],
      favouredColours: ["navy", "black", "ivory"],
      avoidColours: ["coral", "mustard"],
      avoidMaterials: ["denim", "tulle"],
      requiredTrims: [{ trim: "pearl", count: 3 }],
      budget: [110, 160],
      fee: [110, 150],
      deadlineDays: [6, 8],
      minQuality: 76,
    },
    lines: {
      request: "I am performing at the recital hall. I will inspect every seam, so do your very best work.",
      delighted:
        "Straight seams, clean grain, perfect finish. I could not have done better myself. Well, perhaps a little.",
      nearMiss: "Good bones. Your seams wander, though. Practise, and show me again.",
    },
  },
  {
    id: "jaz",
    name: "Jaz",
    relation: "Style creator, huge following",
    careers: ["student", "label"],
    traitGate: "trendsetter",
    minReputation: 6,
    look: { skinTone: "espresso", hairStyle: "braids", hairColour: "pastel-pink", outfit: "denim-jacket" },
    brief: {
      occasion: "Collab photo shoot",
      requiredTags: ["bold", "playful"],
      favouredColours: ["rose", "gold", "sky"],
      avoidColours: ["charcoal"],
      avoidMaterials: ["wool"],
      requiredTrims: [
        { trim: "sequin-patch", count: 1 },
        { trim: "bow", count: 1 },
      ],
      budget: [90, 140],
      fee: [80, 110],
      deadlineDays: [3, 5],
      minQuality: 66,
    },
    lines: {
      request: "Collab time! I need a look my followers can't stop talking about. Make it pop!",
      delighted: "The post is blowing up and everyone's asking for your name. Collab number two?",
      nearMiss: "Cute! Not quite a showstopper, but we found some good angles.",
    },
  },
  {
    id: "mr-abara",
    name: "Mr. Abara",
    relation: "Director, community theatre",
    careers: ["student", "label"],
    traitGate: "charmer",
    minReputation: 4,
    look: { skinTone: "cocoa", hairStyle: "short-bob", hairColour: "black", outfit: "cardigan" },
    brief: {
      occasion: "Lead costume for a fairy-tale play",
      requiredTags: ["regal", "dreamy"],
      favouredColours: ["gold", "plum", "ruby"],
      avoidColours: ["charcoal"],
      avoidMaterials: ["denim"],
      requiredTrims: [{ trim: "lace", count: 2 }],
      budget: [100, 150],
      fee: [95, 130],
      deadlineDays: [6, 8],
      minQuality: 66,
    },
    lines: {
      request:
        "Our queen needs a costume that reaches the back row. I hear you have a way with people and with fabric.",
      delighted:
        "Standing ovation! Half of it was for the gown. Have you ever thought about designing for the stage?",
      nearMiss: "Under the lights it carried well enough. Thank you for jumping in for us.",
    },
  },
  {
    id: "valentina",
    name: "Valentina",
    relation: "Pageant finalist",
    careers: ["label"],
    minReputation: 20,
    look: { skinTone: "honey", hairStyle: "long-waves", hairColour: "blonde", outfit: "blazer" },
    brief: {
      occasion: "Regional pageant evening gown round",
      requiredTags: ["regal", "elegant"],
      favouredColours: ["gold", "ruby", "emerald"],
      avoidColours: ["mustard"],
      avoidMaterials: ["denim", "linen"],
      requiredTrims: [{ trim: "pearl", count: 4 }],
      budget: [180, 260],
      fee: [180, 240],
      deadlineDays: [5, 7],
      minQuality: 72,
    },
    lines: {
      request: "The evening gown round is everything. I want to glide onto that stage and own it.",
      delighted: "The judges' faces when I walked out! This gown is a crown of its own.",
      nearMiss: "It's a good gown. The stage just asked for a touch more polish.",
    },
  },
  {
    id: "harbour-gala",
    name: "Ms. Okafor",
    relation: "Charity gala host",
    careers: ["label"],
    minReputation: 20,
    look: { skinTone: "espresso", hairStyle: "high-bun", hairColour: "black", outfit: "blazer" },
    brief: {
      occasion: "Hosting the harbour charity gala",
      requiredTags: ["elegant"],
      favouredColours: ["teal", "navy", "gold"],
      avoidColours: ["coral"],
      avoidMaterials: ["denim"],
      requiredTrims: [
        { trim: "ribbon-belt", count: 1 },
        { trim: "pearl", count: 2 },
      ],
      budget: [160, 240],
      fee: [160, 220],
      deadlineDays: [5, 8],
      minQuality: 70,
    },
    lines: {
      request:
        "I'll be on stage all evening raising funds for the harbour school. Elegant, comfortable and memorable, please.",
      delighted: "We beat our fundraising goal, and three guests asked for your card.",
      nearMiss: "A gracious dress. It did its job, though it didn't quite sparkle.",
    },
  },
];
