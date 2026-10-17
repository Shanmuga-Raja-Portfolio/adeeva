import { useRef, useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { SAFETY_LINE } from "../../../content/hints";
import { cutToleranceMm, motifPathIds, runCutPaths } from "../../../core";
import { CelebrationBurst } from "../../art/CelebrationBurst";
import { metalLook } from "../../art/metalLook";
import { readCutDraft, writeCutDraft } from "../../cutDraft";
import { useAssist } from "../../useAssist";
import { useFocusCarry } from "../../useFocusCarry";
import { CutLoupe } from "./CutLoupe";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./cut.css";

export function CutStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [assist, setAssist] = useAssist("cut");
  const paths = runCutPaths(run);
  const firstOpen = paths.find((path) => !Object.hasOwn(run.cuts, path.id))?.id ?? null;
  const [picked, setPicked] = useState<string | null>(null);
  const activeId = picked !== null && !Object.hasOwn(run.cuts, picked) ? picked : firstOpen;
  const active = paths.find((path) => path.id === activeId);
  const outer = active === undefined ? undefined : paths.find((path) => path.id === active.partKey);
  const metalId = run.design.metalId;
  const piece = `${run.id}-${run.seed}`;
  const draftKey = `${activeId ?? "none"}-${assist ? "rail" : "hand"}`;
  const done = paths.filter((path) => Object.hasOwn(run.cuts, path.id)).length;
  const master = run.purpose.kind === "collection" ? (state.collection?.motifMaster ?? null) : null;
  const motifIds =
    run.purpose.kind === "collection" ? motifPathIds(run, state.collection?.brief?.motif ?? null) : [];
  const motifCut = active !== undefined && motifIds.includes(active.id);
  useFocusCarry(
    stageRef,
    `${active?.id ?? "none"}-${assist ? "rail" : "hand"}`,
    '[data-testid="cut-loupe"], [data-testid="advance-stage"]:not(:disabled)',
  );
  return (
    <div className="jb-cut" ref={stageRef}>
      <div className="jb-work">
        <aside className="jb-work__list jb-measure">
          <header>
            <strong>Shapes to cut</strong>
            <span className="jb-muted">
              {" "}
              {done}/{paths.length} cut
            </span>
          </header>
          <ul>
            {paths.map((path) => {
              const record = run.cuts[path.id];
              return (
                <li key={path.id}>
                  <button
                    type="button"
                    className="jb-work__item"
                    disabled={record !== undefined}
                    aria-pressed={path.id === activeId}
                    onClick={() => setPicked(path.id)}
                  >
                    <span>{path.name}</span>
                    <span className="jb-work__state">
                      {record !== undefined ? (
                        <>
                          <Icon name="check" size={14} /> {Math.round(record.accuracy * 100)}%
                        </>
                      ) : (
                        "To cut"
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {motifIds.length > 0 ? (
            <p className="jb-master-chip" data-testid="motif-master">
              <Icon name="star" size={14} />
              {master === null
                ? "Your first motif cut becomes the motif master."
                : `Motif master: ${Math.round(master * 100)}%. Match its gold outline!`}
            </p>
          ) : null}
          <ToggleSwitch
            label="Guide rail"
            description="The saw follows the line and turns at the dots."
            checked={assist}
            onChange={setAssist}
          />
          <p className="jb-hint">{assistHint("the guide rail")}</p>
          <p className="jb-safety">
            <Icon name="shield" size={14} /> {SAFETY_LINE}
          </p>
        </aside>
        <div className="jb-work__stage">
          <CelebrationBurst key={done} active={done > 0} />
          {active !== undefined && outer !== undefined && metalId !== null ? (
            <CutLoupe
              key={`${active.id}-${assist ? "rail" : "hand"}`}
              path={active}
              outerPath={outer}
              toleranceMm={cutToleranceMm(state, metalId)}
              assisted={assist}
              metal={metalLook(metalId, "high-shine")}
              reducedMotion={reducedMotion}
              masterOutline={motifCut && master !== null}
              draft={readCutDraft(piece, draftKey)}
              onDraft={(strokes) => writeCutDraft(piece, draftKey, strokes)}
              onDone={(strokes, pxPerMm) => {
                if (dispatch({ type: "cutPath", pathId: active.id, strokes, pxPerMm, assisted: assist }))
                  writeCutDraft(piece, draftKey, []);
              }}
            />
          ) : (
            <div className="jb-work__done">
              <Icon name="sparkle" size={32} />
              <p>Every shape is cut out. Crisp edges!</p>
            </div>
          )}
        </div>
      </div>
      <StageFooter {...props} ready="All cut out. Off to the Joining Lamp!" />
    </div>
  );
}
