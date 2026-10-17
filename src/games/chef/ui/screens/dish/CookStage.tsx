import { skinHex } from "../../../../../ui/art/avatar/Avatar";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { CookStepKind } from "../../../content/dish";
import {
  chopWindow,
  cuisineJars,
  currentCookStep,
  dishById,
  dishTasteStart,
  simmerHalo,
  tasteRadius,
  toleranceFor,
} from "../../../core";
import { useAssist } from "../../useAssist";
import { ChopBoard } from "../cook/ChopBoard";
import { SimmerPot } from "../cook/SimmerPot";
import { SizzleStation } from "../cook/SizzleStation";
import { TasteCompass } from "../cook/TasteCompass";
import { STATION_TITLES } from "./stageNames";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

function Station({ props, kind }: { readonly props: StageProps; readonly kind: CookStepKind }) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const [assist] = useAssist(kind);
  const dish = dishById(run.dishId);
  const tolerance = toleranceFor(state, kind);
  const item = dish.chop[run.chop.length];
  return (
    <div className="ck-station">
      <header className="ck-station__header">
        <h2 className="ck-stage-title">{STATION_TITLES[kind]}</h2>
      </header>
      {kind === "chop" && item !== undefined ? (
        <ChopBoard
          key={run.chop.length}
          item={item}
          difficulty={state.profile.difficulty}
          window={chopWindow(tolerance)}
          assisted={assist}
          reducedMotion={reducedMotion}
          hand={skinHex(state.profile.look)}
          onDone={(record) => dispatch({ type: "chopItem", itemIndex: run.chop.length, record })}
        />
      ) : null}
      {kind === "sizzle" && dish.sizzle !== null ? (
        <SizzleStation
          def={dish.sizzle}
          assisted={assist}
          reducedMotion={reducedMotion}
          onDone={(record) => dispatch({ type: "cookSizzle", record })}
        />
      ) : null}
      {kind === "simmer" && dish.simmer !== null ? (
        <SimmerPot
          def={dish.simmer}
          laps={dish.simmer.laps}
          halo={simmerHalo(tolerance, assist)}
          colour={dish.simmer.colour}
          assisted={assist}
          reducedMotion={reducedMotion}
          stored={run.simmer?.follow ?? null}
          onProgress={(sample) => dispatch({ type: "stirSimmer", sample })}
          onStop={(follow) => {
            dispatch({ type: "stirSimmer", sample: follow });
            dispatch({ type: "stopSimmer" });
          }}
        />
      ) : null}
      {kind === "taste" && dish.taste !== null ? (
        <TasteCompass
          def={dish.taste}
          jars={cuisineJars(dish.cuisine)}
          start={dishTasteStart(dish.taste)}
          radius={tasteRadius(tolerance)}
          helper={false}
          assisted={assist}
          reducedMotion={reducedMotion}
          onDone={(record) => dispatch({ type: "tasteDish", ...record })}
        />
      ) : null}
    </div>
  );
}

export function CookStage(props: StageProps) {
  const dish = dishById(props.run.dishId);
  const current = currentCookStep(props.run, dish);
  return (
    <div className="ck-cook">
      {current === null ? (
        <div className="ck-cook__done">
          <Icon name="sparkle" size={36} />
          <h2 className="ck-stage-title">Everything's cooked!</h2>
          <p>Time to plate it beautifully.</p>
        </div>
      ) : (
        <Station key={current} props={props} kind={current} />
      )}
      {current === null ? <StageFooter {...props} /> : null}
    </div>
  );
}
