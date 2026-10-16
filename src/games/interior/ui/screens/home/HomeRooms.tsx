import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { isRoomReady, purseLeft, TOP_UP_STEP, topUpIssue } from "../../../core";
import { CrewBoard } from "./CrewBoard";
import type { HomeStageProps } from "./HomeScreen";
import { RoomCard } from "./RoomCard";

export function HomeRooms({ state, project, dispatch, onOpenRoom, onEndDay }: HomeStageProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const larkspur = state.larkspur;
  const ready = project.rooms.filter((room) => isRoomReady(room)).length;
  return (
    <div className="is-rooms">
      <p className="is-home__hint" role="status">
        <Icon name="home" size={16} /> {ready} of {project.rooms.length} rooms ready. Make the hero room
        yourself, and let the crew help with the rest.
      </p>
      <div className="is-rooms__layout">
        <div className="is-rooms__cards">
          {project.rooms.map((_, index) => (
            <RoomCard
              key={index}
              state={state}
              project={project}
              index={index}
              dispatch={dispatch}
              onOpen={onOpenRoom}
            />
          ))}
        </div>
        <aside className="is-rooms__side">
          <section className="is-purse is-tape-card" aria-labelledby="is-purse-title">
            <span className="ad-eyebrow">Bellwind's project purse</span>
            <h2 id="is-purse-title">
              <Icon name="coin" size={20} /> <span data-testid="purse-left">{purseLeft(project)}</span> left
            </h2>
            <p className="is-muted">
              Shopping at the Larkspur Supply Yard and crew wages come from here, never from your coins. What
              you save comes back as a thank-you.
            </p>
            <Button
              size="sm"
              variant="secondary"
              disabledReason={topUpIssue(state) ?? undefined}
              onClick={(event) => {
                if (once(event, { type: "topUpPurse" }))
                  toast(`You added ${TOP_UP_STEP} coins to the purse.`, "info");
              }}
            >
              Top up the purse · {TOP_UP_STEP}
            </Button>
          </section>
          {larkspur === null ? null : (
            <CrewBoard state={state} larkspur={larkspur} project={project} dispatch={dispatch} />
          )}
          <Button size="lg" variant="secondary" icon="calendar" onClick={onEndDay} data-testid="home-end-day">
            End the day
          </Button>
        </aside>
      </div>
    </div>
  );
}
