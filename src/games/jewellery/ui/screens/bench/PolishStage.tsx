import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { isPolished, partMask, productById, shineShare } from "../../../core";
import { CelebrationBurst } from "../../art/CelebrationBurst";
import { metalLook } from "../../art/metalLook";
import { useAssist } from "../../useAssist";
import { PolishPad } from "./PolishPad";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./polish.css";

export function PolishStage(props: StageProps) {
  const { run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const [assist, setAssist] = useAssist("polish");
  const [restarts, setRestarts] = useState(0);
  const parts = productById(run.design.productId).parts;
  const firstOpen =
    parts.find((part) => !isPolished(run.polish[part.key], partMask(run, part)))?.key ??
    parts[0]?.key ??
    null;
  const [picked, setPicked] = useState<string | null>(null);
  const activeKey = picked ?? firstOpen;
  const active = parts.find((part) => part.key === activeKey);
  const metalId = run.design.metalId;
  const polishedCount = parts.filter((part) => isPolished(run.polish[part.key], partMask(run, part))).length;
  const nextPart = parts.find(
    (part) => part.key !== activeKey && !isPolished(run.polish[part.key], partMask(run, part)),
  );
  return (
    <div className="jb-polish">
      <div className="jb-work">
        <aside className="jb-work__list jb-measure">
          <header>
            <strong>Pieces to polish</strong>
            <span className="jb-muted">
              {" "}
              {polishedCount}/{parts.length} shining
            </span>
          </header>
          <ul>
            {parts.map((part) => {
              const record = run.polish[part.key];
              const mask = partMask(run, part);
              return (
                <li key={part.key}>
                  <button
                    type="button"
                    className="jb-work__item"
                    aria-pressed={part.key === activeKey}
                    onClick={() => setPicked(part.key)}
                  >
                    <span>{part.name}</span>
                    <span className="jb-work__state">
                      {isPolished(record, mask) ? <Icon name="check" size={14} /> : null}
                      {record === undefined ? "Dull" : `${Math.round(shineShare(record, mask) * 100)}%`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <ToggleSwitch
            label="Buffing wheel"
            description="The wheel polishes a whole piece for you."
            checked={assist}
            onChange={setAssist}
          />
          <p className="jb-hint">{assistHint("the buffing wheel")}</p>
        </aside>
        <div className="jb-work__stage">
          <CelebrationBurst key={polishedCount} active={polishedCount > 0} />
          {active !== undefined ? (
            <PolishPad
              key={`${active.key}-${restarts}`}
              run={run}
              part={active}
              mask={partMask(run, active)}
              record={run.polish[active.key]}
              metal={metalLook(metalId, "high-shine")}
              assisted={assist}
              reducedMotion={reducedMotion}
              onStroke={(samples, pxPerMm) => {
                setPicked(active.key);
                dispatch({ type: "polishStroke", partKey: active.key, samples, pxPerMm });
              }}
              next={
                nextPart === undefined ? null : { name: nextPart.name, onPick: () => setPicked(nextPart.key) }
              }
              onBuff={() => dispatch({ type: "buffPart", partKey: active.key })}
              onRestart={() => {
                if (dispatch({ type: "restartPolish", partKey: active.key }))
                  setRestarts((count) => count + 1);
              }}
            />
          ) : null}
        </div>
      </div>
      <StageFooter {...props} ready="Sparkling! Let's dress it up." />
    </div>
  );
}
