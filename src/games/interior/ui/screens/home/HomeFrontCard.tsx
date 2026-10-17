import { Icon } from "../../../../../ui/kit/IconSet";
import { paintById, plotById, homeStoryById, type Project } from "../../../core";
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
import { roomHex } from "../../art/roomHex";

interface HomeFrontCardProps {
  readonly project: Project;
  readonly ready: number;
}

export function HomeFrontCard({ project, ready }: HomeFrontCardProps) {
  const plot = plotById(project.plotId);
  const story = homeStoryById(project.storyId);
  return (
    <section className="is-front" aria-label={`No. ${plot.number} Larkspur Close`} data-testid="home-front">
      <LarkspurBackdrop className="is-front__street" plot={plot.number} />
      <div className="is-front__note">
        <span className="ad-eyebrow">No. {plot.number} Larkspur Close</span>
        <strong className="is-front__title">{story.name}</strong>
        <p className="is-front__blurb">{story.blurb}</p>
        <div className="is-front__row">
          <span className="is-front__chips" aria-label="Home palette">
            {project.palette.paints.map((paintId) => (
              <span
                key={paintId}
                className="is-front__chip"
                style={{ background: roomHex(paintById(paintId).colour) }}
                title={paintById(paintId).name}
              />
            ))}
          </span>
          <span className="is-front__ready">
            {ready} of {project.rooms.length} rooms ready
          </span>
        </div>
        <p className="is-front__hint" role="status">
          <Icon name="home" size={16} /> Make the hero room yourself, and let the crew help with the rest.
        </p>
      </div>
    </section>
  );
}
