import type { AvatarGarment } from "../../../../ui/art/avatar/Avatar";
import type { AvatarLook } from "../../../../engine/avatar";
import { CLIENTS } from "../../content/client";
import { HALL_PEOPLE } from "../../content/hallPeople";
import { MENTORS } from "../../content/mentor";
import { cuisineById } from "../../core";
import { chefWhites } from "./chefWhites";

export interface SpeakerLook {
  readonly look: AvatarLook;
  readonly garment: AvatarGarment | undefined;
}

const CLIENT_SPEAKERS: Readonly<Record<string, string>> = {
  Isadora: "isadora-moonlight",
  Dami: "dami-market-taster",
  "Mrs. Bell": "thursday-table",
};

export function speakerLook(speaker: string): SpeakerLook | null {
  const mentor = MENTORS.find((entry) => entry.shortName === speaker || entry.name === speaker);
  if (mentor !== undefined)
    return { look: mentor.look, garment: chefWhites(cuisineById(mentor.cuisine).accent) };
  const person = HALL_PEOPLE.find((entry) => entry.name === speaker);
  if (person !== undefined)
    return { look: person.look, garment: person.id === "teo" ? chefWhites("#f2a93b") : undefined };
  const clientId = CLIENT_SPEAKERS[speaker];
  const client = CLIENTS.find((entry) => entry.id === clientId || entry.name === speaker);
  return client === undefined ? null : { look: client.look, garment: undefined };
}
