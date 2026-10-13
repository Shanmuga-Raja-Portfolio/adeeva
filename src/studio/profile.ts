import {
  ACCESSORIES,
  avatarLookParser,
  DEFAULT_LOOK,
  type AccessoryId,
  type AvatarLook,
} from "../engine/avatar";
import { arrayOf, isPlainObject, nullable, objectOf, oneOf, refined, stringParser } from "../engine/parse";
import { MAX_NAME_LENGTH } from "../engine/profile";
import { HOME_THEMES, isPerkId, type HomeThemeId } from "./perks";
import { readStoredJson } from "./storedJson";

export const PROFILE_KEY = "studio.profile";

export interface StudioProfile {
  readonly version: 1;
  readonly name: string;
  readonly look: AvatarLook;
  readonly accessory: AccessoryId | null;
  readonly theme: HomeThemeId;
  readonly perks: readonly string[];
}

export const NEW_PROFILE: StudioProfile = {
  version: 1,
  name: "",
  look: DEFAULT_LOOK,
  accessory: null,
  theme: "morning",
  perks: [],
};

const profileParser = objectOf<StudioProfile>({
  version: oneOf([1] as const),
  name: refined(stringParser, (name) => name.length <= MAX_NAME_LENGTH, "a short name"),
  look: avatarLookParser,
  accessory: nullable(oneOf(ACCESSORIES)),
  theme: oneOf(HOME_THEMES),
  perks: arrayOf(refined(stringParser, isPerkId, "a known perk")),
});

export function parseProfile(raw: unknown): StudioProfile | null {
  const outcome = profileParser(raw, "profile");
  return outcome.ok ? outcome.value : null;
}

export function profileFromSave(rawSave: unknown): StudioProfile {
  if (!isPlainObject(rawSave) || !isPlainObject(rawSave.profile)) return NEW_PROFILE;
  const { name, look } = rawSave.profile;
  const parsedLook = avatarLookParser(look, "look");
  const trimmed = typeof name === "string" ? name.trim() : "";
  return {
    ...NEW_PROFILE,
    name: trimmed.length <= MAX_NAME_LENGTH ? trimmed : "",
    look: parsedLook.ok ? parsedLook.value : DEFAULT_LOOK,
  };
}

export function writeProfile(profile: StudioProfile): boolean {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function loadProfile(seedSave: () => unknown): StudioProfile {
  const stored = parseProfile(readStoredJson(PROFILE_KEY));
  if (stored !== null) return stored;
  const seeded = profileFromSave(seedSave());
  writeProfile(seeded);
  return seeded;
}
