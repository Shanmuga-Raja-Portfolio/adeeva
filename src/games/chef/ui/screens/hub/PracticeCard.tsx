import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { CAREER } from "../../../content/career";

export function PracticeCard({ onPick, lead }: { readonly onPick: () => void; readonly lead: string }) {
  return (
    <Card title="Practice kitchen" eyebrow={`${CAREER.dishHours} hours · no pay`} className="ck-panel">
      <p className="ck-muted">{lead}</p>
      <Button variant="secondary" block icon="heart" onClick={onPick} data-testid="practice">
        Practise a dish
      </Button>
    </Card>
  );
}
