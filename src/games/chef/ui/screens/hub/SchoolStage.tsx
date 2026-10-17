import { useState, type ReactNode } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import type { IconName } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import {
  canEndDay,
  canPotWash,
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
  testStartIssues,
  type GameState,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { SchoolScene, type SchoolGuide } from "../../art/SchoolScene";
import { ClassBoardDrawer } from "./ClassBoardDrawer";
import "./sceneHub.css";
import "./school.css";

export interface SchoolStageProps {
  readonly state: GameState;
  readonly board: ReactNode;
  readonly coach: ReactNode;
  readonly onStartLesson: (event: ClickLike) => void;
  readonly onTakeTest: () => void;
  readonly onNextTestDish: (event: ClickLike) => void;
  readonly onPractice: () => void;
  readonly onBackToDish: () => void;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

interface Choice {
  readonly label: string;
  readonly icon: IconName;
  readonly onClick: (event: ClickLike) => void;
  readonly testId?: string | undefined;
  readonly reason?: string | undefined;
}

interface Mentor extends SchoolGuide {
  readonly name: string;
  readonly line: string;
}

interface Today {
  readonly eyebrow?: string | undefined;
  readonly headline: string;
  readonly primary: Choice;
  readonly mentor?: Mentor | undefined;
}

function today(props: SchoolStageProps): Today {
  const { state } = props;
  const run = state.activeRun;
  if (run !== null && run.stage !== "done")
    return {
      headline: `Your ${dishById(run.dishId).name} is waiting on the board.`,
      primary: {
        label: "Back to your dish",
        icon: "sparkle",
        onClick: props.onBackToDish,
        testId: "back-to-dish",
      },
    };
  const day = state.testDay;
  const next = day === null ? undefined : day.dishIds[day.qualities.length];
  if (day !== null && next !== undefined)
    return {
      headline: `Graduation Practical: dish ${day.qualities.length + 1} of ${day.dishIds.length}.`,
      primary: {
        label: `Cook the ${dishById(next).name}`,
        icon: "sparkle",
        onClick: props.onNextTestDish,
        testId: "next-test-dish",
        reason: nextTestDishIssue(state) ?? undefined,
      },
    };
  const lesson = state.board.lesson;
  if (lesson !== null)
    return {
      eyebrow: `Today's class with Chef ${mentorFor(lesson.cuisine).shortName}`,
      headline: lessonDish(lesson.cuisine).name,
      mentor: guideFor(state) ?? undefined,
      primary: {
        label: "Start the lesson",
        icon: "sparkle",
        onClick: props.onStartLesson,
        testId: "start-lesson",
        reason: lessonStartIssue(state) ?? undefined,
      },
    };
  const test = testFor(state.rung);
  if (test !== null && state.testDay === null && testGoals(state, test).length === 0)
    return {
      headline: `You're ready for the ${testById(test).name}!`,
      primary: {
        label: `Take the ${testById(test).name}`,
        icon: "star",
        onClick: props.onTakeTest,
        testId: "take-test",
        reason: testStartIssues(state, test)[0],
      },
    };
  return {
    headline: isFamilyMeal(state.calendar.day)
      ? "Family Meal: no classes today. Practise a dish, then rest."
      : "No more lessons today. Practise a dish, or rest up for tomorrow.",
    primary: { label: "Practise a dish", icon: "heart", onClick: props.onPractice },
  };
}

function guideFor(state: GameState): Mentor | null {
  const lesson = state.board.lesson;
  if (lesson === null) return null;
  const mentor = mentorFor(lesson.cuisine);
  return {
    look: mentor.look,
    garment: chefWhites(cuisineById(lesson.cuisine).accent),
    name: mentor.shortName,
    line: mentor.teaches,
  };
}

export function SchoolStage(props: SchoolStageProps) {
  const { state } = props;
  const [drawer, setDrawer] = useState(false);
  const plan = today(props);
  const potWash = canPotWash(state);
  const endDay = canEndDay(state);
  const lesson = state.board.lesson;
  return (
    <section className="ck-scene-hub ck-school" aria-labelledby="ck-school-title">
      <div className="ck-scene-hub__stage">
        <SchoolScene
          player={state.profile.look}
          today={lesson?.cuisine}
          guide={guideFor(state)}
          className="ck-scene-hub__art"
        />
      </div>
      {props.coach}
      <div className="ck-scene-hub__hud">
        <div className="ck-scene-hub__today ck-school__today">
          {plan.mentor === undefined ? null : (
            <Avatar
              look={plan.mentor.look}
              garment={plan.mentor.garment}
              mood="delighted"
              size={80}
              frameColour="#ffe2a8"
              title={`Chef ${plan.mentor.name}`}
            />
          )}
          <div className="ck-school__words">
            {plan.eyebrow === undefined ? null : <span className="ad-eyebrow">{plan.eyebrow}</span>}
            <h1 id="ck-school-title" className="ck-scene-hub__headline">
              {plan.headline}
            </h1>
            {plan.mentor === undefined ? null : <p className="ck-school__quote">“{plan.mentor.line}”</p>}
          </div>
        </div>
        <div className="ck-scene-hub__choices">
          <div className="ck-scene-hub__links ck-school__minor">
            <Button
              variant="secondary"
              size="sm"
              icon="board"
              onClick={() => setDrawer(true)}
              data-testid="open-board"
            >
              Class board
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="calendar"
              onClick={props.onEndDay}
              disabledReason={endDay.reasons[0]}
              data-testid="end-day"
            >
              End the day
            </Button>
          </div>
          {potWash.ok ? (
            <Button
              variant="secondary"
              size="lg"
              icon="coin"
              onClick={props.onPotWash}
              data-testid="pot-wash"
            >
              Wash pots for {CAREER.potWashPay} coins
            </Button>
          ) : null}
          <Button
            size="lg"
            icon={plan.primary.icon}
            onClick={plan.primary.onClick}
            disabledReason={plan.primary.reason}
            showReason
            data-testid={plan.primary.testId}
          >
            {plan.primary.label}
          </Button>
        </div>
      </div>
      <ClassBoardDrawer state={state} open={drawer} onClose={() => setDrawer(false)}>
        {props.board}
      </ClassBoardDrawer>
    </section>
  );
}
