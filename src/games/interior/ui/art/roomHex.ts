import { roomColourById, type RoomColour } from "../../content/roomColour";

export const BARE_WALL = "#dccab6";
export const BARE_FLOOR = "#c0a282";

export function roomHex(colour: RoomColour): string {
  return roomColourById(colour).hex;
}
