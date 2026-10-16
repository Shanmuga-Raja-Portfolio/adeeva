import type { FurnitureId } from "../../content/furniture";
import { Bed, Bunk, Daybed, DoubleBed } from "./furniture/BedSprites";
import { BeanBag, Chair, HallBench, Sofa, Armchair, WindowSeat } from "./furniture/SeatSprites";
import {
  BedsideTable,
  CoffeeTable,
  ConsoleTable,
  Desk,
  DiningSet,
  DiningTable,
} from "./furniture/TableSprites";
import { Bookcase, ChestOfDrawers, Sideboard, Wardrobe } from "./furniture/StorageSprites";
import { PlantStand, PlayTent, ToyBox, UprightPiano } from "./furniture/PlaySprites";
import type { Box } from "./furniture/spriteBox";

interface FurnitureSpriteProps {
  readonly furnitureId: FurnitureId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly unit: number;
  readonly fill: string;
  readonly soft: string;
}

export function FurnitureSprite({ furnitureId, x, y, width, unit, fill, soft }: FurnitureSpriteProps) {
  const box: Box = { w: width, u: unit, fill, soft, line: Math.max(1, unit * 0.035) };
  const body = (() => {
    switch (furnitureId) {
      case "single-bed":
        return <Bed {...box} />;
      case "bunk-bed":
        return <Bunk {...box} />;
      case "desk":
        return <Desk {...box} />;
      case "desk-chair":
        return <Chair {...box} />;
      case "wardrobe":
        return <Wardrobe {...box} />;
      case "bookcase":
        return <Bookcase {...box} />;
      case "sofa":
        return <Sofa {...box} />;
      case "armchair":
        return <Armchair {...box} />;
      case "coffee-table":
        return <CoffeeTable {...box} />;
      case "dining-table":
        return <DiningTable {...box} />;
      case "toy-box":
        return <ToyBox {...box} />;
      case "window-seat":
        return <WindowSeat {...box} />;
      case "double-bed":
        return <DoubleBed {...box} />;
      case "bedside-table":
        return <BedsideTable {...box} />;
      case "chest-of-drawers":
        return <ChestOfDrawers {...box} />;
      case "dining-set":
        return <DiningSet {...box} />;
      case "sideboard":
        return <Sideboard {...box} />;
      case "console-table":
        return <ConsoleTable {...box} />;
      case "hall-bench":
        return <HallBench {...box} />;
      case "bean-bag":
        return <BeanBag {...box} />;
      case "play-tent":
        return <PlayTent {...box} />;
      case "plant-stand":
        return <PlantStand {...box} />;
      case "upright-piano":
        return <UprightPiano {...box} />;
      case "daybed":
        return <Daybed {...box} />;
    }
  })();
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <ellipse cx={0} cy={0} rx={width * 0.52} ry={unit * 0.12} fill="#2b2230" opacity={0.16} />
      {body}
    </g>
  );
}
