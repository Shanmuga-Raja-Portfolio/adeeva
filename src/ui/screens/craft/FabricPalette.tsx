import { useState } from "react";
import { FABRICS, type FabricDef } from "../../../content/fabric";
import { PART_CATEGORIES, type PartCategory } from "../../../content/garmentPart";
import {
  fabricById,
  fabricChoiceIssue,
  materialById,
  partById,
  type Action,
  type DressRun,
  type GameState,
} from "../../../core";
import { FabricSwatch } from "../../art/FabricSwatch";

export interface FabricPaletteProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => void;
}

type Target = PartCategory | "all";

const CATEGORY_NAMES: Readonly<Record<PartCategory, string>> = {
  bodice: "Bodice",
  neckline: "Neckline",
  sleeves: "Sleeves",
  skirt: "Skirt",
};

function fabricOrder(state: GameState, fabric: FabricDef): number {
  if ((state.inventory.fabricMetres[fabric.id] ?? 0) > 0) return 0;
  return fabricChoiceIssue(state, fabric.id) === null ? 1 : 2;
}

export function FabricPalette({ state, run, dispatch }: FabricPaletteProps) {
  const [target, setTarget] = useState<Target>("all");
  const needing = PART_CATEGORIES.filter((category) => {
    const partId = run.design.parts[category];
    return partId !== null && (partById(partId)?.pieces.length ?? 0) > 0;
  });
  const activeTarget: Target = target !== "all" && !needing.includes(target) ? "all" : target;
  const targets: readonly PartCategory[] = activeTarget === "all" ? needing : [activeTarget];
  const fabrics = [...FABRICS].sort(
    (a, b) => fabricOrder(state, a) - fabricOrder(state, b) || a.pricePerMetre - b.pricePerMetre,
  );
  const choose = (fabricId: string) => {
    for (const category of targets) dispatch({ type: "chooseSketchFabric", category, fabricId });
  };
  if (needing.length === 0)
    return (
      <p className="ad-muted ad-fabric-palette__empty">Choose the parts first, then dress them in fabric.</p>
    );
  return (
    <div className="ad-fabric-palette">
      <div className="ad-fabric-palette__targets" role="radiogroup" aria-label="Apply fabric to">
        {(["all", ...needing] as const).map((option) => {
          const fabricId = option === "all" ? null : run.design.fabrics[option];
          const fabric = fabricId === null ? undefined : fabricById(fabricId);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={activeTarget === option}
              className="ad-fabric-palette__target"
              onClick={() => setTarget(option)}
            >
              {fabric !== undefined ? <FabricSwatch fabric={fabric} size={26} decorative /> : null}
              {option === "all" ? "Whole dress" : CATEGORY_NAMES[option]}
            </button>
          );
        })}
      </div>
      <ul className="ad-fabric-palette__grid">
        {fabrics.map((fabric) => {
          const issue = fabricChoiceIssue(state, fabric.id);
          const owned = state.inventory.fabricMetres[fabric.id] ?? 0;
          const selected = targets.every((category) => run.design.fabrics[category] === fabric.id);
          return (
            <li key={fabric.id}>
              <button
                type="button"
                className={selected ? "ad-fabric-choice ad-fabric-choice--selected" : "ad-fabric-choice"}
                aria-pressed={selected}
                disabled={issue !== null}
                title={issue ?? fabric.name}
                onClick={() => choose(fabric.id)}
                data-fabric={fabric.id}
              >
                <FabricSwatch
                  fabric={fabric}
                  size={64}
                  selected={selected}
                  locked={issue !== null}
                  decorative
                />
                <span className="ad-fabric-choice__name">{fabric.name}</span>
                <span className="ad-fabric-choice__meta">
                  {materialById(fabric.material).name} · {fabric.pricePerMetre}/m
                </span>
                {owned > 0 ? <span className="ad-fabric-choice__owned">{owned} m owned</span> : null}
                {issue !== null ? <span className="ad-fabric-choice__lock">{issue}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
