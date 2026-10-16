import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { SET_TEMPLATES, type SetTemplateId } from "../../../content/setTemplate";
import { fairBoothByNumber, productById, setStartCheck, type GameState } from "../../../core";

export interface SetTemplatesCardProps {
  readonly state: GameState;
  readonly onStart: (event: ClickLike, templateId: SetTemplateId) => void;
}

export function SetTemplatesCard({ state, onStart }: SetTemplatesCardProps) {
  const fair = state.fair;
  if (state.career !== "showroom" || fair === null) return null;
  const booth = fairBoothByNumber(fair.booth);
  const check = setStartCheck(state);
  return (
    <Card title="Make a matched set" eyebrow="One wood, one finish, one style" className="ww-hub-card">
      <ul className="ww-sets">
        {SET_TEMPLATES.map((template) => {
          const fits = template.pieces.length >= booth.minPieces && template.pieces.length <= booth.maxPieces;
          return (
            <li key={template.id} className={fits ? "ww-sets__item ww-sets__item--fits" : "ww-sets__item"}>
              <div>
                <strong>{template.name}</strong>
                <span className="ww-muted">
                  {template.pieces.map((productId) => productById(productId).name).join(" · ")}
                </span>
                {fits ? (
                  <span className="ww-sets__fit">
                    <Icon name="check" size={14} /> Fits the {booth.name}
                  </span>
                ) : null}
              </div>
              <Button
                size="sm"
                variant={fits ? "primary" : "secondary"}
                onClick={(event) => onStart(event, template.id)}
                disabledReason={check.ok ? undefined : check.reasons[0]}
                data-testid={`start-set-${template.id}`}
              >
                Start
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
