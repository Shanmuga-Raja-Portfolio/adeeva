import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { AssistSwitch } from "../../../../adeeva/ui/screens/craft/AssistSwitch";
import { SewingMachine } from "../../../../adeeva/ui/screens/craft/SewingMachine";
import "../../../../adeeva/ui/screens/craft/sew.css";
import { HINTS } from "../../../content/hint";
import {
  ASSIST_SEW_ACCURACY_CAP,
  findById,
  runSeams,
  isSeamSewn,
  mainFind,
  materialById,
  seamAccuracy,
  sewBand,
} from "../../../core";
import { findCloth } from "../../art/findCloth";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./cut/cut.css";

export function SewStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { settings, updateSettings } = useSettings();
  const seams = runSeams(run);
  const firstOpen = seams.find((seam) => !isSeamSewn(run, seam.id));
  const [picked, setPicked] = useState<string | null>(() => firstOpen?.id ?? seams[0]?.id ?? null);
  const active = seams.find((seam) => seam.id === picked) ?? seams[0];
  const main = mainFind(run);
  const find = main === null ? null : findById(main.findId);
  const cloth = find === null ? null : findCloth(find);
  const nextOpen = seams.find((seam) => seam.id !== active?.id && !isSeamSewn(run, seam.id));
  const sewn = seams.filter((seam) => isSeamSewn(run, seam.id)).length;
  return (
    <div className="tf-sew">
      <div className="tf-sew__side">
        <header>
          <strong>Seams</strong>
          <span className="ad-muted">
            {sewn}/{seams.length} sewn
          </span>
        </header>
        <ul className="tf-sew__list">
          {seams.map((seam) => {
            const progress = run.seams[seam.id];
            const value = progress?.progress ?? 0;
            return (
              <li key={seam.id}>
                <button
                  type="button"
                  className={seam.id === active?.id ? "tf-seam tf-seam--active" : "tf-seam"}
                  onClick={() => setPicked(seam.id)}
                  aria-pressed={seam.id === active?.id}
                  data-seam={seam.id}
                >
                  <span>{seam.name}</span>
                  <strong>
                    {isSeamSewn(run, seam.id) ? (
                      <>
                        <Icon name="check" size={14} />{" "}
                        {progress === undefined ? 0 : Math.round(seamAccuracy(progress) * 100)}%
                      </>
                    ) : value > 0 ? (
                      `${Math.round(value * 100)}%`
                    ) : (
                      "Not yet"
                    )}
                  </strong>
                </button>
              </li>
            );
          })}
        </ul>
        <AssistSwitch
          label="Assist sew"
          detail={`A wider guide line. Assisted seams count up to ${Math.round(ASSIST_SEW_ACCURACY_CAP * 100)}%.`}
          checked={settings.assistSew}
          onChange={(assistSew) => updateSettings({ assistSew })}
        />
        {find !== null ? (
          <p className="ad-muted">
            {materialById(find.material).name}{" "}
            {materialById(find.material).sewDifficulty >= 0.5
              ? "is slippery, so the line is narrow."
              : "feeds smoothly."}
          </p>
        ) : null}
      </div>
      <div className="tf-sew__machine">
        <p className="tf-hint">
          <Icon name="needle" size={18} />
          {HINTS.sew}
        </p>
        {active !== undefined && cloth !== null && find !== null ? (
          <SewingMachine
            key={active.id}
            seamName={active.name}
            profile={active.profile}
            fabric={cloth}
            band={sewBand(state, find.material, settings.assistSew)}
            stored={run.seams[active.id]}
            assisted={settings.assistSew}
            onRecord={(sample) => dispatch({ type: "recordSeam", seamId: active.id, ...sample })}
            onReset={() => dispatch({ type: "resetSeam", seamId: active.id })}
            onNext={nextOpen !== undefined ? () => setPicked(nextOpen.id) : null}
          />
        ) : null}
      </div>
      <StageFooter {...props} hint="All sewn up! Time for finishing touches." />
    </div>
  );
}
