import { useState } from "react";
import { useSettings } from "../../../../../../studio/SettingsContext";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { AssistSwitch } from "../../../../../adeeva/ui/screens/craft/AssistSwitch";
import { HINTS } from "../../../../content/hint";
import {
  ASSIST_UNPICK_CAP,
  findById,
  isLineDone,
  lineRecord,
  maxPull,
  MIN_PULL_CM,
  runLines,
  trimById,
} from "../../../../core";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { StitchBench, type StitchPullRequest } from "./StitchBench";
import "../workbench.css";

interface Feedback {
  readonly key: number;
  readonly kind: "pop" | "snag" | "saved" | "tiny";
  readonly text: string;
}

const FEEDBACK_TEXT = {
  pop: "Pop!",
  snag: "Snag! Too far. Try a shorter pull.",
  tiny: "Pull a little further.",
} as const;

export function UnpickStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { settings, reducedMotion, updateSettings } = useSettings();
  const [findIndex, setFindIndex] = useState(0);
  const [chosenLine, setChosenLine] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const owned = run.finds[findIndex] ?? run.finds[0];
  if (owned === undefined) return null;
  const find = findById(owned.findId);
  const lines = runLines(run, owned);
  const firstOpen = lines.find((entry) => !isLineDone(entry.def, lineRecord(run, owned.id, entry.index)));
  const lineIndex = chosenLine ?? firstOpen?.index ?? lines[0]?.index ?? 0;
  const line = lines.find((entry) => entry.index === lineIndex)?.def;
  const record = lineRecord(run, owned.id, lineIndex);
  const limit = maxPull(state, find.material);
  const sharpRipper = state.upgrades.includes("sharp-ripper");
  const allLines = run.finds.flatMap((entry) =>
    runLines(run, entry).map(({ def, index }) => ({ entry, def, index })),
  );
  const stitchesOut = allLines.reduce(
    (sum, { entry, index }) => sum + lineRecord(run, entry.id, index).popped.length,
    0,
  );
  const stitchesTotal = allLines.reduce((sum, { def }) => sum + def.stitches, 0);
  const snags = allLines.reduce(
    (sum, { entry, index }) => sum + lineRecord(run, entry.id, index).snagsAt.length,
    0,
  );

  const pull = (request: StitchPullRequest) => {
    if (line === undefined) return;
    const pops = request.assisted || (request.distanceCm >= MIN_PULL_CM && request.distanceCm <= limit);
    const kind = request.assisted || request.distanceCm >= MIN_PULL_CM ? (pops ? "pop" : "snag") : "tiny";
    if (kind !== "tiny")
      dispatch({
        type: "pullStitch",
        findKey: owned.id,
        line: lineIndex,
        stitch: request.stitch,
        distanceCm: request.distanceCm,
        assisted: request.assisted,
      });
    const notion = line.notions.find((entry) => entry.stitch === request.stitch);
    const earlierSnags = record.snagsAt.filter((stitch) => stitch === request.stitch).length;
    const saved = kind === "pop" && notion !== undefined && earlierSnags < (sharpRipper ? 2 : 1);
    setFeedback((previous) => ({
      key: (previous?.key ?? 0) + 1,
      kind: saved ? "saved" : kind,
      text: saved && notion !== undefined ? `Saved a ${trimById(notion.notion).name}!` : FEEDBACK_TEXT[kind],
    }));
    if (kind === "pop" && record.popped.length + 1 >= line.stitches) setChosenLine(null);
  };

  return (
    <div className="tf-workbench">
      <div className="tf-workbench__top">
        {run.finds.length > 1 ? (
          <div className="tf-tabs" role="tablist" aria-label="Finds on the bench">
            {run.finds.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={index === findIndex}
                className="tf-tab"
                onClick={() => {
                  setFindIndex(index);
                  setChosenLine(null);
                }}
              >
                {findById(entry.findId).name}
              </button>
            ))}
          </div>
        ) : null}
        <p className="tf-hint">
          <Icon name="scissors" size={18} />
          {settings.assistUnpick ? "Tap each stitch to pop it." : HINTS.unpick}
        </p>
      </div>
      <div className="tf-workbench__lines" role="tablist" aria-label="Stitch lines">
        {lines.map(({ def, index }, position) => {
          const lineState = lineRecord(run, owned.id, index);
          const done = isLineDone(def, lineState);
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === lineIndex}
              className={done ? "tf-line-chip tf-line-chip--done" : "tf-line-chip"}
              onClick={() => setChosenLine(index)}
              data-line={index}
            >
              {done ? <Icon name="check" size={14} /> : null}
              {lines.length === 1 ? "The split" : `Line ${position + 1}`} · {lineState.popped.length}/
              {def.stitches}
            </button>
          );
        })}
      </div>
      <div className="tf-workbench__table">
        {line !== undefined ? (
          <StitchBench
            key={`${owned.id}-${lineIndex}`}
            find={find}
            line={line}
            record={record}
            maxPullCm={limit}
            assist={settings.assistUnpick}
            sharpRipper={sharpRipper}
            reducedMotion={reducedMotion}
            onPull={pull}
          />
        ) : null}
        {feedback !== null ? (
          <span key={feedback.key} className={`tf-burst tf-burst--${feedback.kind}`} role="status">
            {feedback.text}
          </span>
        ) : null}
      </div>
      <div className="tf-workbench__status">
        <div className="tf-progress" aria-label={`${stitchesOut} of ${stitchesTotal} stitches out`}>
          <span style={{ width: `${(100 * stitchesOut) / Math.max(1, stitchesTotal)}%` }} />
        </div>
        <span>
          {stitchesOut}/{stitchesTotal} stitches out · {snags} {snags === 1 ? "snag" : "snags"} · safe pull up
          to {limit.toFixed(1)} cm
        </span>
        <AssistSwitch
          label="Assist snip"
          detail={`Tap to pop stitches. Counts up to ${Math.round(ASSIST_UNPICK_CAP * 100)}%.`}
          checked={settings.assistUnpick}
          onChange={(assistUnpick) => updateSettings({ assistUnpick })}
        />
        {snags >= 3 && !settings.assistUnpick ? <p className="tf-hint">{HINTS.assist}</p> : null}
        <p className="tf-safety">{HINTS.tools}</p>
      </div>
      <StageFooter {...props} hint="Every stitch is out. The panels lie flat!" />
    </div>
  );
}
