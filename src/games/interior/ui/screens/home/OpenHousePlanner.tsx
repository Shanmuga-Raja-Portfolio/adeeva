import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import { HOME_HINTS } from "../../../content/hints";
import { TOUR_MUSIC, type TourMusicId } from "../../../content/tourMusic";
import { TOUR_TIMES, type TourTimeId } from "../../../content/tourTime";
import {
  achebePlan,
  homeStoryById,
  planOpenHouseIssue,
  plotById,
  purposeById,
  roomQualities,
  STAGING_HOURS,
  stageIssue,
  tourRooms,
  samePlan,
  type TourChoice,
} from "../../../core";
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
import { StoryCard } from "../larkspur/StoryCard";
import type { HomeStageProps } from "./HomeScreen";

interface Draft {
  readonly tour: readonly number[];
  readonly music: TourMusicId | null;
  readonly time: TourTimeId | null;
}

function RadioRow<T extends string>({
  label,
  options,
  value,
  onChange,
  testId,
}: {
  readonly label: string;
  readonly options: readonly { readonly value: T; readonly name: string; readonly word: string }[];
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly testId: string;
}) {
  const radio = useRovingRadio(options, value, onChange);
  return (
    <div className="is-planner__radios" role="radiogroup" aria-label={label} data-testid={testId}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={radio.buttonRef(index)}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={radio.tabIndex(index)}
          className="is-planner__radio"
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => radio.handleKey(event, index)}
        >
          <strong>{option.name}</strong>
          <span>{option.word}</span>
        </button>
      ))}
    </div>
  );
}

function fromPlan(plan: TourChoice): Draft {
  return { tour: plan.tour, music: plan.music, time: plan.time };
}

export function OpenHousePlanner({ state, project, dispatch, onOpenOpenHouse, onEndDay }: HomeStageProps) {
  const once = useDispatchOnce(state, dispatch);
  const story = homeStoryById(project.storyId);
  const plot = plotById(project.plotId);
  const suggestion = achebePlan(state, project);
  const qualities = roomQualities(state, project);
  const [draft, setDraft] = useState<Draft>(() =>
    project.plan !== null
      ? fromPlan(project.plan)
      : state.profile.difficulty === "relaxed"
        ? fromPlan(suggestion)
        : { tour: tourRooms(project), music: null, time: null },
  );
  const change = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const plan: TourChoice | null =
    draft.music === null || draft.time === null
      ? null
      : { tour: draft.tour, music: draft.music, time: draft.time };
  const planIssue = plan === null ? "Pick the music and the time of day." : planOpenHouseIssue(state, plan);
  const saved = project.plan !== null && plan !== null && samePlan(project.plan, plan);
  const capped = plan !== null && state.profile.difficulty !== "relaxed" && samePlan(plan, suggestion);
  const stage = stageIssue(state);
  const done = project.stage === "done";
  const move = (position: number, step: number) => {
    const target = position + step;
    if (target < 0 || target >= draft.tour.length) return;
    const tour = [...draft.tour];
    const [moved] = tour.splice(position, 1);
    if (moved === undefined) return;
    tour.splice(target, 0, moved);
    change({ tour });
  };
  const hall = project.map.spaces.indexOf("hall");
  return (
    <div className="is-planner">
      <p className="is-home__hint" role="status">
        <Icon name="sparkle" size={16} /> {HOME_HINTS.planner}
      </p>
      <div className="is-planner__layout">
        <aside className="is-planner__story">
          <StoryCard story={story} />
          <div className="is-planner__preview" aria-hidden="true">
            <LarkspurBackdrop time={draft.time ?? "afternoon"} plot={plot.number} openSign />
          </div>
        </aside>
        <section className="is-planner__plan" aria-label="The Open House plan">
          <h2 className="is-tray__heading">The tour</h2>
          <ol className="is-planner__tour" data-testid="tour-list">
            {hall >= 0 ? (
              <li className="is-planner__stop is-planner__stop--fixed">
                <span className="is-planner__num">
                  <Icon name="home" size={14} />
                </span>
                <span>Front door and the Entrance Hall</span>
              </li>
            ) : null}
            {draft.tour.map((index, position) => (
              <li key={index} className="is-planner__stop" data-testid={`tour-stop-${position}`}>
                <span className="is-planner__num">{position + 1}</span>
                <span className="is-planner__room">
                  <strong>{purposeById(project.map.spaces[index] ?? "hall").name}</strong>
                  <span className="is-muted">Room quality {qualities[index] ?? 0}</span>
                </span>
                {done ? null : (
                  <span className="is-planner__moves">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={position === 0}
                      onClick={() => move(position, -1)}
                      aria-label={`Move ${purposeById(project.map.spaces[index] ?? "hall").name} earlier`}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={position === draft.tour.length - 1}
                      onClick={() => move(position, 1)}
                      aria-label={`Move ${purposeById(project.map.spaces[index] ?? "hall").name} later`}
                    >
                      ↓
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ol>
          <h2 className="is-tray__heading">The music</h2>
          <RadioRow
            label="Music"
            options={TOUR_MUSIC.map((music) => ({ value: music.id, name: music.name, word: music.word }))}
            value={draft.music}
            onChange={(music) => change({ music })}
            testId="music-choice"
          />
          <h2 className="is-tray__heading">The time of day</h2>
          <RadioRow
            label="Time of day"
            options={TOUR_TIMES.map((time) => ({ value: time.id, name: time.name, word: time.word }))}
            value={draft.time}
            onChange={(time) => change({ time })}
            testId="time-choice"
          />
          {capped && !done ? (
            <p className="is-muted" data-testid="achebe-cap">
              {HOME_HINTS.achebePlan}
            </p>
          ) : null}
          {done ? (
            <div className="is-planner__actions">
              <Button size="lg" icon="star" onClick={onOpenOpenHouse} data-testid="see-open-house">
                See the Open House notes
              </Button>
            </div>
          ) : (
            <div className="is-planner__actions">
              <Button
                variant="secondary"
                icon="sparkle"
                onClick={() => setDraft(fromPlan(suggestion))}
                data-testid="achebe-plan"
              >
                Ms. Achebe suggests…
              </Button>
              <Button
                disabledReason={saved ? "This plan is set." : (planIssue ?? undefined)}
                onClick={(event) => {
                  if (plan !== null) once(event, { type: "planOpenHouse", plan });
                }}
                data-testid="set-plan"
              >
                {project.plan === null ? "Set the plan" : "Update the plan"}
              </Button>
            </div>
          )}
          {project.stage === "show" ? (
            <div className="is-planner__doors is-tape-card" data-testid="doors-card">
              <p>
                <Icon name="calendar" size={16} /> {stage ?? "Everything is ready. Open the doors!"}
              </p>
              <div className="is-planner__actions">
                <Button
                  size="lg"
                  icon="home"
                  disabledReason={stage ?? undefined}
                  onClick={(event) => {
                    if (once(event, { type: "stageOpenHouse" })) onOpenOpenHouse();
                  }}
                  data-testid="open-doors"
                >
                  Open the doors <span className="is-footer__hours">{STAGING_HOURS} h</span>
                </Button>
                <Button variant="secondary" icon="calendar" onClick={onEndDay} data-testid="planner-end-day">
                  End the day
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
