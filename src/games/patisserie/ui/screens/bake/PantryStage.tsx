import { PantryShop } from "./PantryShop";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function PantryStage(props: StageProps) {
  return (
    <div className="pa-pantry-stage">
      <PantryShop state={props.state} run={props.run} dispatch={props.dispatch} />
      <StageFooter {...props} ready="Everything's on the bench. Time to weigh!" />
    </div>
  );
}
