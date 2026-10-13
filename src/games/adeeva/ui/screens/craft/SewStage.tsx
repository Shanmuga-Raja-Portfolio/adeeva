import { useState } from "react";
import {
  ASSIST_SEW_ACCURACY_CAP,
  fabricById,
  materialById,
  requiredSeams,
  seamAccuracy,
  sewBand,
} from "../../../core";
import { useSettings } from "../../../../../studio/SettingsContext";
import { FabricSwatch } from "../../art/FabricSwatch";
import { Icon } from "../../../../../ui/kit/IconSet";
import { AssistSwitch } from "./AssistSwitch";
import { SewingMachine } from "./SewingMachine";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./sew.css";

export function SewStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { settings, updateSettings } = useSettings();
  const seams = requiredSeams(run.design);
  const firstOpen = seams.find((entry) => (run.seams[entry.seam.id]?.progress ?? 0) < 1);
  const [picked, setPicked] = useState<string | null>(() => firstOpen?.seam.id ?? seams[0]?.seam.id ?? null);
  const activeId = picked ?? seams[0]?.seam.id ?? null;
  const active = seams.find((entry) => entry.seam.id === activeId);
  const fabric = active?.fabricId ? fabricById(active.fabricId) : undefined;
  const material = fabric !== undefined ? materialById(fabric.material) : undefined;
  const stored = active !== undefined ? run.seams[active.seam.id] : undefined;
  const nextOpen = seams.find(
    (entry) => entry.seam.id !== activeId && (run.seams[entry.seam.id]?.progress ?? 0) < 1,
  );
  const sewn = seams.filter((entry) => (run.seams[entry.seam.id]?.progress ?? 0) >= 1).length;

  return (
    <div className="ad-sew-stage">
      <div className="ad-sew-stage__side">
        <header className="ad-sew-stage__header">
          <strong>Seams</strong>
          <span className="ad-muted">
            {sewn}/{seams.length} sewn
          </span>
        </header>
        <ul className="ad-seam-list">
          {seams.map((entry) => {
            const progress = run.seams[entry.seam.id];
            const value = progress?.progress ?? 0;
            const seamFabric = entry.fabricId ? fabricById(entry.fabricId) : undefined;
            return (
              <li key={entry.seam.id}>
                <button
                  type="button"
                  className={
                    entry.seam.id === activeId ? "ad-seam-item ad-seam-item--active" : "ad-seam-item"
                  }
                  onClick={() => setPicked(entry.seam.id)}
                  aria-pressed={entry.seam.id === activeId}
                  data-seam={entry.seam.id}
                >
                  {seamFabric !== undefined ? (
                    <FabricSwatch fabric={seamFabric} size={32} decorative />
                  ) : null}
                  <span className="ad-seam-item__name">{entry.seam.name}</span>
                  <span
                    className={
                      value >= 1 ? "ad-seam-item__state ad-seam-item__state--done" : "ad-seam-item__state"
                    }
                  >
                    {value >= 1 ? (
                      <>
                        <Icon name="check" size={14} />{" "}
                        {progress === undefined ? 0 : Math.round(seamAccuracy(progress) * 100)}%
                      </>
                    ) : value > 0 ? (
                      `${Math.round(value * 100)}% sewn`
                    ) : (
                      "Not started"
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <AssistSwitch
          label="Assist sew"
          detail={`Assist sewing widens the guide so it is easier to stay on the line. Assisted seams count up to ${Math.round(ASSIST_SEW_ACCURACY_CAP * 100)}%.`}
          checked={settings.assistSew}
          onChange={(assistSew) => updateSettings({ assistSew })}
        />
        {material !== undefined ? (
          <p className="ad-sew-stage__material ad-muted">
            {material.name}{" "}
            {material.sewDifficulty >= 0.5
              ? "is slippery, so the band is narrow."
              : "feeds smoothly under the foot."}
          </p>
        ) : null}
      </div>
      <div className="ad-sew-stage__machine">
        {active !== undefined && fabric !== undefined ? (
          <SewingMachine
            key={active.seam.id}
            seamId={active.seam.id}
            seamName={active.seam.name}
            profile={active.seam.profile}
            fabric={fabric}
            band={sewBand(state, fabric.material, settings.assistSew)}
            stored={stored}
            assisted={settings.assistSew}
            dispatch={dispatch}
            onNext={nextOpen !== undefined ? () => setPicked(nextOpen.seam.id) : null}
          />
        ) : null}
      </div>
      <StageFooter {...props} hint="Every seam is sewn. Let's add some sparkle." />
    </div>
  );
}
