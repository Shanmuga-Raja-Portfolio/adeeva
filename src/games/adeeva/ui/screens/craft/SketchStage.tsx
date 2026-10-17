import { GARMENT_PARTS, PART_CATEGORIES, type PartCategory } from "../../../content/garmentPart";
import { dressTags } from "../../../core";
import { DressPreview } from "../../art/DressPreview";
import { Card } from "../../../../../ui/kit/Card";
import { designFabrics, designParts } from "../../art/designLook";
import { BriefChecklist } from "./BriefChecklist";
import { FabricPalette } from "./FabricPalette";
import { PartCard } from "./PartCard";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./sketch.css";

const CATEGORY_TITLES: Readonly<Record<PartCategory, string>> = {
  bodice: "Bodice",
  neckline: "Neckline",
  sleeves: "Sleeves",
  skirt: "Skirt",
};

export function SketchStage(props: StageProps) {
  const { run, dispatch } = props;
  const parts = designParts(run.design);
  const fabrics = designFabrics(run.design);
  const tags = dressTags(run.design, run.placements, run.decorations);
  const wanted = run.brief.requiredTags;
  return (
    <div className="ad-sketch-stage">
      <div className="ad-sketch-stage__work">
        <BriefChecklist state={props.state} run={run} variant="strip" />
        {PART_CATEGORIES.map((category) => (
          <section
            key={category}
            className="ad-sketch-row"
            aria-label={`${CATEGORY_TITLES[category]} options`}
          >
            <h2 className="ad-sketch-row__title">{CATEGORY_TITLES[category]}</h2>
            <div className="ad-sketch-row__cards">
              {GARMENT_PARTS.filter((part) => part.category === category).map((part) => (
                <PartCard
                  key={part.id}
                  part={part}
                  parts={parts}
                  fabrics={fabrics}
                  selected={run.design.parts[category] === part.id}
                  onChoose={() => dispatch({ type: "chooseSketchPart", category, partId: part.id })}
                />
              ))}
            </div>
          </section>
        ))}
        <Card title="Dress it in fabric" eyebrow="Owned fabric first, then the shop catalogue">
          <FabricPalette state={props.state} run={run} dispatch={dispatch} />
        </Card>
      </div>
      <div className="ad-sketch-stage__preview">
        <div className="ad-sketch-stage__doll">
          <div className="ad-sketch-stage__figure" key={JSON.stringify(run.design)}>
            <DressPreview
              parts={parts}
              fabrics={fabrics}
              pose="graceful"
              title="Your sketch on the croquis"
            />
          </div>
        </div>
        <div className="ad-sketch-stage__tags" aria-label="How the dress feels">
          <span className="ad-eyebrow">It feels</span>
          <ul>
            {tags.length === 0 ? <li className="ad-muted">Pick parts to see the mood</li> : null}
            {tags.map((tag) => (
              <li
                key={tag}
                className={wanted.includes(tag) ? "ad-mood-tag ad-mood-tag--wanted" : "ad-mood-tag"}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <StageFooter {...props} hint="Happy with the sketch? The fabric shop is next." />
    </div>
  );
}
