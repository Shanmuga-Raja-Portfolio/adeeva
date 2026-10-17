import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { pipeTolerance, runPipePaths } from "../../../core";
import { bakeLook, icingHex, spongeHex } from "../../art/bakeLook";
import { TableTop } from "../../art/TableTop";
import { useAssist } from "../../useAssist";
import { PipeTable } from "./PipeTable";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./pipe.css";

const COPY_SETS = ["cupcake-tray", "iced-biscuits", "petit-fours", "tartlet-set", "biscuit-wreath"] as const;

export function PipeStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const [assist, setAssist] = useAssist("pipe");
  const paths = runPipePaths(run);
  const firstOpen = paths.find((path) => !Object.hasOwn(run.pipes, path.id))?.id ?? null;
  const [picked, setPicked] = useState<string | null>(null);
  const activeId = picked !== null && !Object.hasOwn(run.pipes, picked) ? picked : firstOpen;
  const active = paths.find((path) => path.id === activeId);
  const look = bakeLook(run.design, [], true);
  if (look === null) return null;
  const done = paths.filter((path) => Object.hasOwn(run.pipes, path.id)).length;
  const struggling = paths.some((path) => (run.pipes[path.id]?.accuracy ?? 1) < 0.8);
  return (
    <div className="pa-pipe">
      <div className="pa-pipe__layout">
        <aside className="pa-pipe__list pa-doily">
          <header>
            <strong>Icing lines</strong>
            <span className="pa-muted">
              {done}/{paths.length} piped
            </span>
          </header>
          <ul>
            {paths.map((path, index) => {
              const record = run.pipes[path.id];
              return (
                <li key={path.id}>
                  <button
                    type="button"
                    className={path.id === activeId ? "pa-pipe__item pa-pipe__item--active" : "pa-pipe__item"}
                    disabled={record !== undefined}
                    aria-pressed={path.id === activeId}
                    onClick={() => setPicked(path.id)}
                  >
                    <span className="pa-pipe__swatch" style={{ background: icingHex(look, index + 1) }} />
                    <span>{path.name}</span>
                    <span className="pa-pipe__state">
                      {record !== undefined ? (
                        <>
                          <Icon name="check" size={14} /> {Math.round(record.accuracy * 100)}%
                        </>
                      ) : (
                        "To pipe"
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <ToggleSwitch
            label="Guide dots"
            description="The bag snaps to the line. Counts up to 80%."
            checked={assist}
            onChange={setAssist}
          />
          {struggling && !assist ? <p className="pa-hint">{assistHint("Guide dots")}</p> : null}
          {COPY_SETS.some((id) => id === run.design.productId) ? (
            <p className="pa-muted pa-pipe__note">The rest of the set copies your best ones.</p>
          ) : null}
          {run.word !== null ? (
            <p className="pa-muted pa-pipe__note">
              Piped words: trace each letter of {run.word}, one stroke at a time.
            </p>
          ) : null}
        </aside>
        <div className="pa-pipe__table">
          <TableTop className="pa-bench-scene" />
          {active !== undefined ? (
            <PipeTable
              key={`${active.id}-${assist ? "a" : "m"}`}
              path={active}
              tolerance={pipeTolerance(state)}
              assisted={assist}
              icing={icingHex(look, paths.indexOf(active) + 1)}
              coat={icingHex(look, 0)}
              sponge={spongeHex(look, 0)}
              reducedMotion={reducedMotion}
              dispatch={dispatch}
            />
          ) : (
            <div className="pa-pipe__all-done">
              <Icon name="sparkle" size={28} />
              <p>Every line is piped. Beautiful!</p>
            </div>
          )}
        </div>
      </div>
      <StageFooter {...props} ready="Piped to perfection. Now the toppings!" />
    </div>
  );
}
