import { Icon } from "../../../../ui/kit/IconSet";

export function CoachBubble({ show, text }: { readonly show: boolean; readonly text: string }) {
  if (!show) return null;
  return (
    <p className="ck-coach" role="note" data-testid="coach-bubble">
      <span className="ck-coach__icon" aria-hidden="true">
        <Icon name="sparkle" size={18} />
      </span>
      {text}
    </p>
  );
}
