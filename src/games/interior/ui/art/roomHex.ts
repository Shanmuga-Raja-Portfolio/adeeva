import { roomColourById, type RoomColour } from "../../content/roomColour";

export const BARE_WALL = "#bcb5b1";
export const BARE_FLOOR = "#a89f99";

export function roomHex(colour: RoomColour): string {
  return roomColourById(colour).hex;
}
