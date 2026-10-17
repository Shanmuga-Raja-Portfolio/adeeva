import { useSettings } from "../../../../../studio/SettingsContext";
import { dishById, toleranceFor } from "../../../core";
import { useAssist } from "../../useAssist";
import { PlateBuilder } from "../cook/PlateBuilder";
import { HelperCard } from "./HelperCard";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function PlateStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const [assist] = useAssist("plate");
  const dish = dishById(run.dishId);
  const plated = run.plated;
  return (
    <div className="ck-station">
      <header className="ck-station__header">
        <h2 className="ck-stage-title">Plate It</h2>
      </header>
      <PlateBuilder
        dish={dish}
        tolerance={toleranceFor(state, "plate")}
        assisted={assist}
        reducedMotion={reducedMotion}
        initial={
          plated === null
            ? null
            : {
                components: plated.components,
                plateColour: plated.plateColour,
                wiped: plated.result.wiped,
                assisted: plated.result.assisted,
              }
        }
        onPlate={(draft) => dispatch({ type: "plateDish", record: draft })}
        helper={
          <HelperCard
            step="plate"
            compact
            note={<span className="ck-helper-card__note">Shows where each part goes.</span>}
          />
        }
        footer={
          plated === null ? null : (
            <StageFooter {...props}>
              <span className="ck-plate__score">Plating {Math.round(plated.result.accuracy * 100)}%</span>
            </StageFooter>
          )
        }
      />
    </div>
  );
}
