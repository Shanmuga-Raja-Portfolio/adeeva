import { roomColourById, type RoomColour } from "../../content/roomColour";

export const BARE_WALL = "#d3c6ba";
export const BARE_FLOOR = "#b8a590";

export function roomHex(colour: RoomColour): string {
  return roomColourById(colour).hex;
}
