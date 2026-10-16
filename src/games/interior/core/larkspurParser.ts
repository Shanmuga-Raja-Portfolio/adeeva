import type { PanelScore } from "../../../engine/panelScore";
import {
  arrayOf,
  booleanParser,
  distinctListOf,
  fixedRecordOf,
  integerParser,
  integerRangeParser,
  keyedRecordOf,
  nullable,
  objectOf,
  oneOf,
  refined,
  stringParser,
} from "../../../engine/parse";
import { countParser, dayParser, shareParser, subScoreParser } from "../../../engine/stateParsers";
import { CREW_IDS, CREW_JOBS, type CrewJob } from "../content/crew";
import { FLOOR_IDS } from "../content/floor";
import { HOME_STORY_IDS } from "../content/homeStory";
import { KEY_IDS, type KeyId } from "../content/openHouseKey";
import { PAINT_IDS } from "../content/paint";
import { HOME_PANEL_IDS, type HomePanelId } from "../content/panelMember";
import { PLOT_IDS, PLOTS } from "../content/plot";
import { PURPOSE_IDS } from "../content/roomPurpose";
import { TOUR_MUSIC_IDS } from "../content/tourMusic";
import { TOUR_TIME_IDS } from "../content/tourTime";
import { plotById } from "./catalog";
import { PALETTE_PAINTS } from "./homePalette";
import { isRoomReady } from "./homeRoom";
import { betterKey } from "./keyWall";
import {
  PROJECT_STAGES,
  type CrewAssignment,
  type CrewState,
  type HomeMap,
  type HomePalette,
  type Larkspur,
  type OpenHousePlan,
  type OpenHouseRecord,
  type PrizeLine,
  type Project,
} from "./larkspur";
import type { MakeoverRun } from "./makeoverRun";
import { planIssue } from "./openHousePlan";
import { plotFor } from "./project";
import { runParser } from "./runParser";
import { stockParser } from "./stockParser";

const jobCountsParser = fixedRecordOf(CREW_JOBS, countParser);

const crewParser = objectOf<CrewState>({
  hired: distinctListOf(CREW_IDS, "crew member"),
  jobsDone: fixedRecordOf(CREW_IDS, jobCountsParser),
});

const mapParser = objectOf<HomeMap>({
  spaces: arrayOf(nullable(oneOf(PURPOSE_IDS))),
  fromAchebe: booleanParser,
});

const paletteParser = objectOf<HomePalette>({
  paints: refined(
    distinctListOf(PAINT_IDS, "paint"),
    (paints) => paints.length <= PALETTE_PAINTS,
    "3 paints",
  ),
  hallFloor: nullable(oneOf(FLOOR_IDS)),
});

const assignmentParser = objectOf<CrewAssignment>({
  crewId: oneOf(CREW_IDS),
  roomIndex: integerRangeParser(0, 9),
  job: oneOf(CREW_JOBS),
  wage: countParser,
});

const planParser = objectOf<OpenHousePlan>({
  tour: arrayOf(integerRangeParser(0, 9)),
  music: oneOf(TOUR_MUSIC_IDS),
  time: oneOf(TOUR_TIME_IDS),
  fromAchebe: booleanParser,
});

const isCrewJob = (key: string): key is CrewJob => CREW_JOBS.some((job) => job === key);

function roomFits(project: Project, room: MakeoverRun | null, index: number): boolean {
  if (room === null) return true;
  return (
    room.purpose.kind === "home-room" &&
    room.purpose.plotId === project.plotId &&
    room.purpose.roomIndex === index &&
    room.purpose.purposeId === project.map.spaces[index]
  );
}

function distinct(values: readonly unknown[]): boolean {
  return new Set(values).size === values.length;
}

function jobFits(project: Project, job: CrewAssignment): boolean {
  const room = project.rooms[job.roomIndex] ?? null;
  return room !== null && room.stage === job.job && room.locked;
}

function projectFits(project: Project): boolean {
  const spaces = plotById(project.plotId).spaces.length;
  const finished = project.stage === "planner" || project.stage === "show" || project.stage === "done";
  const planned = project.stage === "show" || project.stage === "done";
  return (
    project.rooms.length === spaces &&
    project.map.spaces.length === spaces &&
    project.rooms.every((room, index) => roomFits(project, room, index)) &&
    (!finished || project.rooms.every((room) => isRoomReady(room))) &&
    planned === (project.plan !== null) &&
    (project.plan === null || planIssue(project, project.plan) === null) &&
    project.crewJobs.every((job) => jobFits(project, job)) &&
    distinct(project.crewJobs.map((job) => job.crewId)) &&
    distinct(project.crewJobs.map((job) => job.roomIndex))
  );
}

const projectParser = refined(
  objectOf<Project>({
    startDay: dayParser,
    plotId: oneOf(PLOT_IDS),
    storyId: oneOf(HOME_STORY_IDS),
    stage: oneOf(PROJECT_STAGES),
    fee: countParser,
    sister: booleanParser,
    map: mapParser,
    palette: paletteParser,
    purse: countParser,
    added: countParser,
    spent: countParser,
    shelf: stockParser,
    rooms: arrayOf(nullable(runParser)),
    crewJobs: arrayOf(assignmentParser),
    coached: keyedRecordOf(isCrewJob, shareParser),
    plan: nullable(planParser),
  }),
  projectFits,
  "a home whose rooms fit its plot",
);

const panelParser = objectOf<PanelScore<HomePanelId>>({
  id: oneOf(HOME_PANEL_IDS),
  label: stringParser,
  score: integerRangeParser(0, 100),
  parts: arrayOf(subScoreParser),
});

const prizeParser = objectOf<PrizeLine>({ label: stringParser, amount: integerParser });

const recordParser = objectOf<OpenHouseRecord>({
  plotId: oneOf(PLOT_IDS),
  storyId: oneOf(HOME_STORY_IDS),
  day: dayParser,
  panels: arrayOf(panelParser),
  overall: integerRangeParser(0, 100),
  keyId: oneOf(KEY_IDS),
  late: booleanParser,
  auto: booleanParser,
  notes: arrayOf(stringParser),
  tip: stringParser,
  prize: arrayOf(prizeParser),
  reputation: integerParser,
  buzz: countParser,
  advance: oneOf(["next", "sister", "choice"] as const),
  plan: planParser,
});

function larkspurFits(larkspur: Larkspur): boolean {
  const project = larkspur.project;
  const hired = (job: CrewAssignment) => larkspur.crew.hired.includes(job.crewId);
  const onPlot = project === null || project.stage === "done" || plotFor(larkspur).id === project.plotId;
  const keysMatch = PLOT_IDS.every((plotId) => {
    const best = larkspur.history
      .filter((record) => record.plotId === plotId)
      .reduce<KeyId | null>((key, record) => betterKey(key, record.keyId), null);
    return larkspur.keyWall[plotId] === best;
  });
  return onPlot && keysMatch && (project === null || project.crewJobs.every(hired));
}

export const larkspurParser = refined(
  objectOf<Larkspur>({
    plot: integerRangeParser(1, PLOTS.length),
    phase: dayParser,
    sisterNext: booleanParser,
    choicePending: booleanParser,
    storyOffer: distinctListOf(HOME_STORY_IDS, "home story"),
    nextStartDay: dayParser,
    project: nullable(projectParser),
    crew: crewParser,
    keyWall: fixedRecordOf(PLOT_IDS, nullable(oneOf(KEY_IDS))),
    history: arrayOf(recordParser),
  }),
  larkspurFits,
  "a street whose keys, crew and plot agree",
);
