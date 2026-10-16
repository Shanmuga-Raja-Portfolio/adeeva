import { Icon } from "../../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../../ui/kit/TagPill";
import { SET_HINTS } from "../../../../content/hint";
import { JOINT_KIND_DEFS } from "../../../../content/jointKind";
import { runPieces, runSlots, setTemplateById, shadeById } from "../../../../core";
import { setLooks } from "../../../art/pieceLook";
import { SetPreview } from "../../../art/SetPreview";
import { SlotChoices, WoodChoices } from "../design/DesignChoices";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";

const SET_JOINT_NOTES = {
  peg: "Two taps. A friendly fit.",
  slot: "Three taps. Neat and strong.",
  comb: "Four taps. The tightest fit, and the panels' favourite.",
} as const;

export function SetDesign(props: StageProps) {
  const { state, run, dispatch } = props;
  const purpose = run.purpose;
  if (purpose.kind !== "set") return null;
  const template = setTemplateById(purpose.templateId);
  const brief = run.brief;
  return (
    <div className="ww-design ww-design--set">
      <div className="ww-set-head">
        <section className="ww-set-card ww-paper" aria-labelledby="ww-set-title">
          <span className="ad-eyebrow">A matched set · one wood, one finish, one style</span>
          <h2 id="ww-set-title">{template.name}</h2>
          <p className="ww-muted">{template.blurb}</p>
          <ul className="ww-set-card__pieces">
            {runPieces(run).map((piece) => (
              <li key={piece.index}>
                {piece.twinOf === null ? <Icon name="star" size={14} /> : <Icon name="sparkle" size={14} />}{" "}
                {piece.name}
                {piece.twinOf === null ? "" : " (a twin, quicker to saw)"}
              </li>
            ))}
          </ul>
          {brief.requiredTags.length > 0 ? (
            <p className="ww-set-card__theme">
              Ready for the Fair:{" "}
              {brief.requiredTags.map((tag) => (
                <TagPill key={tag} tone="sage">
                  {tag}
                </TagPill>
              ))}{" "}
              in {brief.favouredColours.map((colour) => shadeById(colour).name.toLowerCase()).join(", ")}
            </p>
          ) : (
            <p className="ww-hint">Pick this season's Fair theme in the shop to see what the panels love.</p>
          )}
        </section>
        <aside className="ww-design__preview ww-paper">
          <span className="ad-eyebrow">The whole set, side by side</span>
          <SetPreview looks={setLooks(run)} title={`Your ${template.name}`} className="ww-design__set" />
        </aside>
      </div>
      <div className="ww-design__choices">
        <SlotChoices run={run} slots={runSlots(run)} dispatch={dispatch} />
        <WoodChoices state={state} run={run} dispatch={dispatch} />
        <section aria-labelledby="ww-set-joint">
          <h2 id="ww-set-joint" className="ww-design__heading">
            Set joint
          </h2>
          <p className="ww-hint">{SET_HINTS.setJoint}</p>
          <div className="ww-design__chips" role="radiogroup" aria-label="Set joint">
            {JOINT_KIND_DEFS.map((kind) => (
              <button
                key={kind.id}
                type="button"
                role="radio"
                aria-checked={purpose.setJoint === kind.id}
                className="ww-design__chip"
                onClick={() => dispatch({ type: "chooseSetJoint", kind: kind.id })}
                data-testid={`set-joint-${kind.id}`}
              >
                <strong>{kind.name}</strong>
                <span className="ww-design__chip-note">{SET_JOINT_NOTES[kind.id]}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <StageFooter {...props} ready="A lovely matched plan! Off to the timber yard." />
    </div>
  );
}
