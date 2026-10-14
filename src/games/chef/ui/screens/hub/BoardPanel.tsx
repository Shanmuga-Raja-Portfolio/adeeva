import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import {
  cuisineById,
  dishById,
  isFamilyMeal,
  lessonDish,
  lessonStartIssue,
  mentorFor,
  nextTestDishIssue,
  testById,
  testFor,
  testGoals,
  testHours,
  testStartIssues,
  type GameState,
  type ShiftOffer,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";

export interface BoardPanelProps {
  readonly state: GameState;
  readonly onStartLesson: (event: ClickLike) => void;
  readonly onDeclineLesson: (event: ClickLike) => void;
  readonly onPickShift: (offer: ShiftOffer) => void;
  readonly onTakeTest: () => void;
  readonly onNextTestDish: (event: ClickLike) => void;
  readonly onOpenService: () => void;
}

function LessonCard({ state, onStartLesson, onDeclineLesson }: BoardPanelProps) {
  const lesson = state.board.lesson;
  if (lesson === null) return null;
  const mentor = mentorFor(lesson.cuisine);
  const cuisine = cuisineById(lesson.cuisine);
  const dish = lessonDish(lesson.cuisine);
  const issue = lessonStartIssue(state);
  return (
    <article
      className="ck-ticket-card"
      style={{ ["--ck-cuisine" as string]: cuisine.accent }}
      data-testid="lesson-card"
    >
      <div className="ck-ticket-card__pin" aria-hidden="true" />
      <div className="ck-ticket-card__who">
        <Avatar
          look={mentor.look}
          garment={chefWhites(cuisine.accent)}
          size={72}
          title={mentor.name}
          frameColour={cuisine.wall}
        />
        <div>
          <span className="ad-eyebrow">Lesson at {cuisine.counter}</span>
          <h3 className="ck-ticket-card__title">{mentor.name}</h3>
          <p className="ck-muted">{mentor.teaches}</p>
        </div>
      </div>
      <p className="ck-ticket-card__dish">
        <strong>{dish.name}</strong> · {dish.blurb}
      </p>
      <ul className="ck-ticket-card__facts">
        <li>
          <Icon name="clock" size={16} /> {CAREER.dishHours} hours
        </li>
        <li>
          <Icon name="coin" size={16} /> Stipend {lesson.fee}
        </li>
        <li>
          <Icon name="star" size={16} /> Aim for quality {CAREER.lessonMinimum}
        </li>
      </ul>
      <div className="ck-ticket-card__actions">
        <Button variant="ghost" size="sm" onClick={onDeclineLesson}>
          Not today
        </Button>
        <Button
          icon="sparkle"
          onClick={onStartLesson}
          disabledReason={issue ?? undefined}
          showReason
          data-testid="start-lesson"
        >
          Start the lesson
        </Button>
      </div>
    </article>
  );
}

function ShiftCards({ state, onPickShift }: BoardPanelProps) {
  const worked = state.lastShiftDay === state.calendar.day;
  return (
    <div className="ck-board__shifts">
      {state.board.shifts.map((offer) => {
        const names = offer.cuisines.map((cuisine) => cuisineById(cuisine).counter);
        const accent = offer.cuisines[0] === undefined ? "#f2a93b" : cuisineById(offer.cuisines[0]).accent;
        return (
          <article
            key={offer.id}
            className="ck-ticket-card"
            style={{ ["--ck-cuisine" as string]: accent }}
            data-testid="shift-card"
          >
            <div className="ck-ticket-card__pin" aria-hidden="true" />
            <span className="ad-eyebrow">{state.rung === "head" ? "Main Kitchen" : "Shift"}</span>
            <h3 className="ck-ticket-card__title">
              {names.length === 0 ? "Hall dinner service" : names.join(" + ")}
            </h3>
            <p className="ck-muted">
              {state.rung === "head"
                ? `Tickets come from your ${CAREER.menuSize}-dish menu.`
                : `Cook ${offer.cuisines.map((cuisine) => cuisineById(cuisine).name).join(" and ")} dishes as tickets arrive.`}
            </p>
            <ul className="ck-ticket-card__facts">
              <li>
                <Icon name="clock" size={16} /> {CAREER.shiftHours} hours
              </li>
            </ul>
            <div className="ck-ticket-card__actions">
              <Button
                icon="sparkle"
                onClick={() => onPickShift(offer)}
                disabledReason={worked ? "You already worked a shift today." : undefined}
                data-testid="pick-shift"
              >
                Work this shift
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function TestCard({ state, onTakeTest }: BoardPanelProps) {
  const test = testFor(state.rung);
  if (test === null) return null;
  const def = testById(test);
  const goals = testGoals(state, test);
  const issue = testStartIssues(state, test)[0];
  return (
    <article className="ck-test-card" data-testid="test-card">
      <span className="ad-eyebrow">Next rung</span>
      <h3>{def.name}</h3>
      <p className="ck-muted">{def.pitch}</p>
      {goals.length === 0 ? (
        <p className="ck-test-card__ready">
          <Icon name="check" size={16} /> Ready! It takes {testHours(test)} hours.
        </p>
      ) : (
        <ul className="ck-test-card__goals">
          {goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      )}
      {goals.length === 0 ? (
        <Button icon="star" onClick={onTakeTest} disabledReason={issue} showReason data-testid="take-test">
          Take the {def.name}
        </Button>
      ) : null}
    </article>
  );
}

function TestDayCard({ state, onNextTestDish }: BoardPanelProps) {
  const day = state.testDay;
  if (day === null) return null;
  const issue = nextTestDishIssue(state);
  const next = day.dishIds[day.qualities.length];
  return (
    <article className="ck-test-card ck-test-card--live" data-testid="test-day">
      <span className="ad-eyebrow">{day.test === "graduation" ? "Graduation Practical" : "Tasting Day"}</span>
      <h3>
        Dish {Math.min(day.qualities.length + 1, day.dishIds.length)} of {day.dishIds.length}
      </h3>
      <ol className="ck-test-card__goals">
        {day.dishIds.map((id, index) => (
          <li key={id}>
            {dishById(id).name}
            {day.qualities[index] === undefined ? "" : ` · quality ${day.qualities[index]}`}
          </li>
        ))}
      </ol>
      {next === undefined ? null : (
        <Button
          icon="sparkle"
          onClick={onNextTestDish}
          disabledReason={issue ?? undefined}
          data-testid="next-test-dish"
        >
          Cook the {dishById(next).name}
        </Button>
      )}
    </article>
  );
}

export function BoardPanel(props: BoardPanelProps) {
  const { state } = props;
  const familyMeal = isFamilyMeal(state.calendar.day);
  const title = state.rung === "student" ? "Class board" : "Shift board";
  return (
    <section className="ck-board" aria-labelledby="ck-board-title">
      <header className="ck-board__header">
        <h2 id="ck-board-title" className="ck-chalk">
          {title}
        </h2>
        <span className="ck-board__note">
          {familyMeal ? "Family Meal: no shifts or tests today" : `Day ${state.calendar.day}`}
        </span>
      </header>
      {state.service !== null ? (
        <article className="ck-test-card ck-test-card--live">
          <h3>Service in progress</h3>
          <Button icon="sparkle" onClick={props.onOpenService} data-testid="back-to-service">
            Back to the service
          </Button>
        </article>
      ) : null}
      <TestDayCard {...props} />
      {state.rung === "student" ? <LessonCard {...props} /> : <ShiftCards {...props} />}
      {state.rung === "student" && state.board.lesson === null && !familyMeal && state.testDay === null ? (
        <p className="ck-board__empty">
          {state.mentorsMet.length === 6 && testGoals(state, "graduation").length === 0
            ? "You've met all six mentors! The Graduation Practical is next."
            : "No more lessons today. A new ticket goes up on the board tomorrow."}
        </p>
      ) : null}
      {familyMeal && state.rung !== "student" ? (
        <p className="ck-board__empty">
          The Hall is closed for Family Meal. Practise a dish or visit the shop.
        </p>
      ) : null}
      {state.testDay === null ? <TestCard {...props} /> : null}
    </section>
  );
}
