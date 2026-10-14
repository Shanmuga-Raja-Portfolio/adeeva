import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import type { CookStepKind } from "../../../content/dish";
import { HINTS } from "../../../content/hints";
import {
  chopWindow,
  cookSteps,
  cuisineJars,
  currentCookStep,
  dishById,
  dishTasteStart,
  runAccuracies,
  simmerHalo,
  tasteRadius,
  toleranceFor,
} from "../../../core";
import { HELPERS } from "../settings/SettingsDialog";
import { useAssist } from "../../useAssist";
import { ChopBoard } from "../cook/ChopBoard";
import { SimmerPot } from "../cook/SimmerPot";
import { SizzleStation } from "../cook/SizzleStation";
import { TasteCompass } from "../cook/TasteCompass";
import { COOK_STEP_NAMES, STATION_TITLES } from "./stageNames";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

const SAFETY_STEPS: readonly CookStepKind[] = ["chop", "sizzle", "simmer"];

function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" className="ck-step-sparkle" aria-hidden="true">
      {[
        { x: 12, y: 12, r: 6 },
        { x: 28, y: 16, r: 4 },
        { x: 18, y: 30, r: 5 },
      ].map(({ x, y, r }) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - r} L${x + r / 3} ${y - r / 3} L${x + r} ${y} L${x + r / 3} ${y + r / 3} L${x} ${y + r} L${x - r / 3} ${y + r / 3} L${x - r} ${y} L${x - r / 3} ${y - r / 3} Z`}
          fill="#f2a93b"
        />
      ))}
    </svg>
  );
}

function StepScores({ props }: { readonly props: StageProps }) {
  const dish = dishById(props.run.dishId);
  const accuracies = runAccuracies(props.run, dish);
  const current = currentCookStep(props.run, dish);
  const steps = cookSteps(dish);
  const done = steps.slice(0, current === null ? steps.length : steps.indexOf(current));
  if (done.length === 0) return null;
  return (
    <ul className="ck-step-scores" aria-label="Steps cooked">
      {done.map((kind) => (
        <li key={kind}>
          <Icon name="check" size={14} /> {COOK_STEP_NAMES[kind]} {Math.round(accuracies[kind] * 100)}%
        </li>
      ))}
      <Sparkle key={done.length} />
    </ul>
  );
}

function Station({ props, kind }: { readonly props: StageProps; readonly kind: CookStepKind }) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const [assist, setAssist] = useAssist(kind);
  const dish = dishById(run.dishId);
  const helper = HELPERS.find((entry) => entry.step === kind);
  const tolerance = toleranceFor(state, kind);
  const item = dish.chop[run.chop.length];
  return (
    <div className="ck-station">
      <header className="ck-station__header">
        <h2 className="ck-stage-title">{STATION_TITLES[kind]}</h2>
        {helper !== undefined ? (
          <ToggleSwitch
            label={helper.label}
            description={`${helper.description} ${HINTS.assist}`}
            checked={assist}
            onChange={setAssist}
          />
        ) : null}
      </header>
      {kind === "chop" && item !== undefined ? (
        <ChopBoard
          key={run.chop.length}
          item={item}
          difficulty={state.profile.difficulty}
          window={chopWindow(tolerance)}
          assisted={assist}
          reducedMotion={reducedMotion}
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
      {SAFETY_STEPS.includes(kind) ? (
        <p className="ck-safety">
          <Icon name="shield" size={14} /> {HINTS.safety}
        </p>
      ) : null}
    </div>
  );
}

export function CookStage(props: StageProps) {
  const dish = dishById(props.run.dishId);
  const current = currentCookStep(props.run, dish);
  return (
    <div className="ck-cook">
      <StepScores props={props} />
      {current === null ? (
        <div className="ck-cook__done">
          <Icon name="sparkle" size={36} />
          <h2 className="ck-stage-title">Everything's cooked!</h2>
          <p>Time to plate it beautifully.</p>
        </div>
      ) : (
        <Station key={current} props={props} kind={current} />
      )}
      <StageFooter {...props} />
    </div>
  );
}
