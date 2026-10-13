import { HAIR_COLOURS, HAIR_STYLES, SKIN_TONES, type AvatarLook } from "../../../../../engine/avatar";
import { seedFromText } from "../../../../../ui/art/seedFromText";

export function modelLook(runId: string, position: number): AvatarLook {
  const seed = seedFromText(runId);
  const skin = SKIN_TONES[(seed + position * 3) % SKIN_TONES.length] ?? SKIN_TONES[0];
  const style = HAIR_STYLES[((seed >>> 5) + position * 3) % HAIR_STYLES.length] ?? HAIR_STYLES[0];
  const hair = HAIR_COLOURS[((seed >>> 11) + position * 2) % 6] ?? HAIR_COLOURS[0];
  return { skinTone: skin.id, hairStyle: style, hairColour: hair.id, outfit: "studio-apron" };
}
