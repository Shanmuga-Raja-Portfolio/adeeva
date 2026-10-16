import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { BUILDER_LOOK } from "../../../content/larkspurStoryBeat";
import {
  allRoomsReady,
  homeStoryById,
  isRoomReady,
  keyById,
  plotById,
  plotFor,
  purseLeft,
  startProjectIssue,
  type Action,
  type GameState,
  type Larkspur,
  type Project,
} from "../../../core";
import { KeyArt } from "../../art/KeyArt";
import { KeyWallBoard } from "./KeyWallBoard";
import { StoryCard } from "./StoryCard";
import "./larkspur.css";
import { OpenHouseDue } from "./OpenHouseDue";

interface LarkspurPanelProps {
  readonly state: GameState;
  readonly larkspur: Larkspur;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenHome: () => void;
  readonly onOpenOpenHouse: () => void;
}

const STAGE_NAMES: Readonly<Record<Project["stage"], string>> = {
  map: "Deciding who lives where",
  palette: "Choosing one home palette",
  rooms: "Making the rooms",
  planner: "Planning the Open House",
  show: "Ready to open the doors",
  done: "Open House done",
};

function Achebe({ line }: { readonly line: string }) {
  return (
    <div className="is-larkspur__achebe">
      <Avatar look={BUILDER_LOOK} mood="happy" size={72} title="Ms. Achebe" frameColour="#fcefc2" />
      <p>
        <strong>Ms. Achebe:</strong> {line}
      </p>
    </div>
  );
}

function ProjectCard({
  state,
  project,
  onOpenHome,
}: {
  readonly state: GameState;
  readonly project: Project;
  readonly onOpenHome: () => void;
}) {
  const plot = plotById(project.plotId);
  const story = homeStoryById(project.storyId);
  const ready = project.rooms.filter((room) => isRoomReady(room)).length;
  return (
    <article className="is-larkspur__project" data-testid="project-card">
      <div className="is-larkspur__door" style={{ background: plot.door }} aria-hidden="true">
        <span>{plot.number}</span>
      </div>
      <div className="is-larkspur__project-body">
        <span className="ad-eyebrow">{STAGE_NAMES[project.stage]}</span>
        <h3>{plot.name}</h3>
        <p className="is-muted">{story.name}</p>
        <ul className="is-larkspur__facts">
          <li>
            <OpenHouseDue project={project} day={state.calendar.day} />
          </li>
          <li>
            <Icon name="coin" size={16} /> Purse {purseLeft(project)} left
          </li>
          <li>
            <Icon name="home" size={16} /> Rooms ready {ready} of {project.rooms.length}
          </li>
        </ul>
      </div>
      <Button size="lg" icon="home" onClick={onOpenHome} data-testid="open-project">
        {allRoomsReady(project) ? "Plan the Open House" : `Go to ${plot.name}`}
      </Button>
    </article>
  );
}

export function LarkspurPanel({
  state,
  larkspur,
  dispatch,
  onOpenHome,
  onOpenOpenHouse,
}: LarkspurPanelProps) {
  const once = useDispatchOnce(state, dispatch);
  const project = larkspur.project;
  const last = larkspur.history[larkspur.history.length - 1];
  const nextPlot = plotFor(larkspur);
  return (
    <section className="is-larkspur" aria-labelledby="is-larkspur-title" data-testid="larkspur-panel">
      <header className="is-larkspur__header">
        <div>
          <span className="ad-eyebrow">Bellwind Homes · Show-Home Designer</span>
          <h2 id="is-larkspur-title">Larkspur Close</h2>
        </div>
        {last === undefined ? null : (
          <button
            type="button"
            className="is-larkspur__last"
            onClick={onOpenOpenHouse}
            data-testid="open-house-notes"
          >
            <KeyArt keyId={last.keyId} size={44} />
            <span>
              <strong>{keyById(last.keyId).name}</strong>
              <span className="is-muted">
                {plotById(last.plotId).name} · {last.overall}
              </span>
            </span>
          </button>
        )}
      </header>
      <div className="is-larkspur__grid">
        <div className="is-larkspur__main">
          {project !== null && project.stage !== "done" ? (
            <ProjectCard state={state} project={project} onOpenHome={onOpenHome} />
          ) : null}
          {project !== null && project.stage === "done" ? (
            <Achebe
              line={`What an Open House! The street is still talking. The next home is ready on day ${larkspur.nextStartDay}.`}
            />
          ) : null}
          {larkspur.choicePending ? (
            <div className="is-larkspur__choice" data-testid="plot-choice">
              <Achebe
                line={
                  state.profile.difficulty === "relaxed"
                    ? "Lovely work. Move to the next plot, or stay for the sister home next door?"
                    : "Stay for the sister home next door, or move to the next plot?"
                }
              />
              <div className="is-larkspur__choice-buttons">
                <Button
                  variant="secondary"
                  onClick={(event) => once(event, { type: "chooseNextPlot", move: false })}
                >
                  Stay for the sister home
                </Button>
                <Button
                  onClick={(event) => once(event, { type: "chooseNextPlot", move: true })}
                  data-testid="move-plot"
                >
                  Move to the next plot
                </Button>
              </div>
            </div>
          ) : null}
          {project === null && !larkspur.choicePending ? (
            <div className="is-larkspur__start">
              <Achebe
                line={
                  state.calendar.day < larkspur.nextStartDay
                    ? `${nextPlot.name} is being swept clean. It's ready on day ${larkspur.nextStartDay}.`
                    : `${nextPlot.name} is ready${larkspur.sisterNext ? ", right next door" : ""}. Which family's story will it tell?`
                }
              />
              <div className="is-larkspur__stories">
                {larkspur.storyOffer.map((storyId) => {
                  const issue = startProjectIssue(state, storyId);
                  return (
                    <StoryCard key={storyId} story={homeStoryById(storyId)} compact>
                      <Button
                        block
                        icon="home"
                        disabledReason={issue ?? undefined}
                        onClick={(event) => {
                          if (once(event, { type: "startProject", storyId })) onOpenHome();
                        }}
                        data-testid={`start-${storyId}`}
                      >
                        Start this home
                      </Button>
                    </StoryCard>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <KeyWallBoard keyWall={larkspur.keyWall} current={larkspur.plot} phase={larkspur.phase} />
      </div>
    </section>
  );
}
