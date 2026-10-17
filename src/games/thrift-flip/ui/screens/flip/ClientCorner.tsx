import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { personById, type FlipRun, type GameState } from "../../../core";
import { requestLine } from "../hub/briefFacts";
import "./corner.css";

export interface ClientCornerProps {
  readonly state: GameState;
  readonly run: FlipRun;
}

export function ClientCorner({ state, run }: ClientCornerProps) {
  const brief = run.brief;
  const client = brief === null ? undefined : personById(brief.clientId);
  const look = client?.look ?? state.profile.look;
  const name = client?.name ?? state.profile.name;
  const line = brief === null ? "This one is for my own rack. I can't wait!" : requestLine(brief, client);
  return (
    <figure className="tf-corner">
      <blockquote className="tf-corner__bubble">“{line}”</blockquote>
      <div className="tf-corner__stage" aria-hidden="true">
        <Avatar look={look} size={96} mood="happy" frameColour="#fde4cf" title={name} />
      </div>
      <figcaption className="tf-corner__name">
        {brief === null ? `${name}, at the bench` : `${name} is waiting`}
      </figcaption>
    </figure>
  );
}
