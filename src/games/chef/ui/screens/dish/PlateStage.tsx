import { useSettings } from "../../../../../studio/SettingsContext";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { dishById, toleranceFor } from "../../../core";
import { HELPERS } from "../settings/SettingsDialog";
import { useAssist } from "../../useAssist";
import { PlateBuilder } from "../cook/PlateBuilder";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function PlateStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const [assist, setAssist] = useAssist("plate");
  const dish = dishById(run.dishId);
  const helper = HELPERS.find((entry) => entry.step === "plate");
  const plated = run.plated;
  return (
    <div className="ck-station">
      <header className="ck-station__header">
        <h2 className="ck-stage-title">Plate It</h2>
        {helper !== undefined ? (
          <ToggleSwitch
            label={helper.label}
            description={helper.description}
            checked={assist}
            onChange={setAssist}
          />
        ) : null}
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
      />
      <StageFooter {...props}>
        {plated === null
          ? "Plate it to see how it looks."
          : `Plating ${Math.round(plated.result.accuracy * 100)}%. Re-plate any time, or send it to the pass.`}
      </StageFooter>
    </div>
  );
}
