import { Button } from "../../../../../../ui/kit/Button";
import { Dialog } from "../../../../../../ui/kit/Dialog";
import { TagPill } from "../../../../../../ui/kit/TagPill";
import type { ConditionGrade } from "../../../../content/condition";
import type { FindId } from "../../../../content/find";
import { conditionById, findById, materialById, trimById } from "../../../../core";
import { FindArt } from "../../../art/FindArt";
import { FitsBadge } from "./FitsBadge";

export interface FindCloseUpProps {
  readonly findId: FindId | null;
  readonly grade: ConditionGrade;
  readonly fits: boolean;
  readonly twoFinds: boolean;
  readonly onClose: () => void;
}

export function FindCloseUp({ findId, grade, fits, twoFinds, onClose }: FindCloseUpProps) {
  const find = findId === null ? null : findById(findId);
  const notions = find?.lines.flatMap((line) => line.notions) ?? [];
  return (
    <Dialog
      open={find !== null}
      title={find?.name ?? "Find"}
      onClose={onClose}
      footer={<Button onClick={onClose}>Back to the rail</Button>}
    >
      {find !== null ? (
        <div className="tf-closeup">
          <FindArt find={find} grade={grade} size={180} />
          <div className="tf-closeup__facts">
            <p className="tf-closeup__story">“{find.backstory}.”</p>
            <p>
              <strong>{conditionById(grade).name}</strong> · {materialById(find.material).name} ·{" "}
              {find.panels.length} {find.panels.length === 1 ? "panel" : "panels"}
            </p>
            <p>Panels: {find.panels.map((panel) => `${panel.width}×${panel.height} cm`).join(", ")}</p>
            <p>
              Saved buttons & bows inside:{" "}
              {notions.length === 0
                ? "none"
                : notions.map((notion) => trimById(notion.notion).name).join(", ")}
            </p>
            <div className="tf-closeup__tags">
              {find.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>
            <FitsBadge fits={fits} twoFinds={twoFinds} />
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
