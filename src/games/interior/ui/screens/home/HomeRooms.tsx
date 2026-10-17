import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { isRoomReady, purseLeft, TOP_UP_STEP, topUpIssue } from "../../../core";
import { CrewBoard } from "./CrewBoard";
import { HomeFrontCard } from "./HomeFrontCard";
import type { HomeStageProps } from "./HomeScreen";
import { RoomCard } from "./RoomCard";
import "./rooms.css";

export function HomeRooms({ state, project, dispatch, onOpenRoom, onEndDay }: HomeStageProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const larkspur = state.larkspur;
  const ready = project.rooms.filter((room) => isRoomReady(room)).length;
  return (
    <div className="is-rooms">
      <div className="is-rooms__layout">
        <div className="is-rooms__main">
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
          <HomeFrontCard project={project} ready={ready} />
        </div>
        <aside className="is-rooms__side">
          <section className="is-purse is-tape-card" aria-labelledby="is-purse-title">
            <span className="is-purse__coin" aria-hidden="true">
              <Icon name="coin" size={30} />
            </span>
            <span className="ad-eyebrow">Bellwind's project purse</span>
            <h2 id="is-purse-title">
              <span data-testid="purse-left">{purseLeft(project)}</span> coins left
            </h2>
            <p className="is-purse__note">
              Bellwind pays for shopping and crew from here, not your coins. Savings come back to you.
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
