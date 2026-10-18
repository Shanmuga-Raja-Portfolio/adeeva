import type { InstallGuide } from "./installGuides";
import { InstallPicture } from "./installPictures";

export interface InstallGuideCardProps {
  readonly guide: InstallGuide;
  readonly open: boolean;
}

export function InstallGuideCard({ guide, open }: InstallGuideCardProps) {
  return (
    <details className="st-guide" open={open} data-testid={`install-${guide.device}`}>
      <summary className="st-guide__summary">
        <span>{guide.title}</span>
        <span className="st-muted">{guide.intro}</span>
      </summary>
      <ol className="st-guide__steps">
        {guide.steps.map((step, index) => (
          <li key={step.scene + String(index)} className="st-guide__step">
            <InstallPicture scene={step.scene} />
            <p>
              <strong>{index + 1}.</strong> {step.text}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}
