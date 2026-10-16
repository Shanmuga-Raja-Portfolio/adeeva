import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { ApprenticeJobId } from "../content/apprentice";
import type { RunStage } from "../content/runStage";
import { renAccuracy, renJobsPerDay, renLevel } from "./apprentice";
import type { CommissionRun, JointRecord, SandRecord } from "./commissionRun";
import type { GameState } from "./gameState";
import { jointTaps } from "./joint";
import { designJoints, designSurfaces, type RunJoint } from "./pieceParts";
import { EMPTY_SAND, isSurfaceDone, MAX_PASSES, sandRecordOf } from "./sanding";
import { queueStoryTrigger } from "./storyQueue";
import { buyIssues, buyPlan, countList, missingPlanBoards } from "./timberYard";

const JOB_STAGES: Readonly<Record<ApprenticeJobId, RunStage>> = {
  fetch: "timber",
  sand: "sand",
  pegs: "join",
};

function renJoints(state: GameState, run: CommissionRun): RunJoint[] {
  const slotToo = state.upgrades.includes("ren-bench");
  return designJoints(run).filter(
    (joint) =>
      !Object.hasOwn(run.joints, joint.id) && (joint.kind === "peg" || (slotToo && joint.kind === "slot")),
  );
}

function workLeft(state: GameState, run: CommissionRun, job: ApprenticeJobId): string | null {
  switch (job) {
    case "fetch": {
      const sizes = countList(missingPlanBoards(state, run));
      if (sizes.length === 0) return "The boards for your plan are already on the rack.";
      return buyIssues(state, sizes, 0).reasons[0] ?? null;
    }
    case "sand":
      return designSurfaces(run).some((part) => !isSurfaceDone(sandRecordOf(run, part.id)))
        ? null
        : "Every surface is already smooth.";
    case "pegs":
      return renJoints(state, run).length > 0 ? null : "Ren is still learning those joints.";
  }
}

export function apprenticeJobCheck(state: GameState, job: ApprenticeJobId): ActionCheck {
  const apprentice = state.apprentice;
  if (state.career !== "showroom" || apprentice === null) return actionCheck(["Ren helps in the showroom."]);
  if (!apprentice.hired) return actionCheck(["Take Ren on first."]);
  if (state.showroom?.rested === true) return actionCheck(["Ren is resting with the shop this season."]);
  if (state.fair?.result?.day === state.calendar.day) return actionCheck(["Ren is enjoying the Fair today."]);
  if (apprentice.jobsToday >= renJobsPerDay(state)) return actionCheck(["Ren has done enough for today."]);
  const run = state.activeRun;
  if (run === null || run.stage !== JOB_STAGES[job]) return actionCheck(["Ren can't help with this step."]);
  if (run.renJobs.includes(job)) return actionCheck(["Ren already did this job."]);
  const left = workLeft(state, run, job);
  return actionCheck(left === null ? [] : [left]);
}

function renSanding(run: CommissionRun, accuracy: number): Record<string, SandRecord> {
  const sanding: Record<string, SandRecord> = { ...run.sanding };
  for (const part of designSurfaces(run)) {
    sanding[part.id] = {
      ...EMPTY_SAND,
      passes: EMPTY_SAND.passes.map(() => MAX_PASSES),
      renAccuracy: accuracy,
    };
  }
  return sanding;
}

function renJointRecords(
  state: GameState,
  run: CommissionRun,
  accuracy: number,
): Record<string, JointRecord> {
  const joints: Record<string, JointRecord> = { ...run.joints };
  for (const joint of renJoints(state, run))
    joints[joint.id] = {
      offsetMm: 0,
      angleDeg: 0,
      goodTaps: jointTaps(joint),
      assisted: false,
      accuracy,
      byApprentice: true,
    };
  return joints;
}

function doneWork(state: GameState, job: ApprenticeJobId): GameState {
  const run = state.activeRun;
  const apprentice = state.apprentice;
  if (run === null || apprentice === null) return state;
  const accuracy = renAccuracy(apprentice.jobsDone);
  if (job === "fetch") {
    const bought = buyPlan(state, 0);
    return bought === state ? state : bought;
  }
  if (job === "sand") return { ...state, activeRun: { ...run, sanding: renSanding(run, accuracy) } };
  return { ...state, activeRun: { ...run, joints: renJointRecords(state, run, accuracy) } };
}

export function handToRen(state: GameState, job: ApprenticeJobId): GameState {
  if (!apprenticeJobCheck(state, job).ok) return state;
  const worked = doneWork(state, job);
  const run = worked.activeRun;
  const apprentice = worked.apprentice;
  if (worked === state || run === null || apprentice === null) return state;
  const before = renLevel(apprentice.jobsDone);
  const jobsDone = apprentice.jobsDone + 1;
  const after = renLevel(jobsDone);
  const next: GameState = {
    ...worked,
    activeRun: { ...run, renJobs: [...run.renJobs, job] },
    apprentice: { ...apprentice, jobsDone, jobsToday: apprentice.jobsToday + 1 },
  };
  if (after === before) return next;
  return queueStoryTrigger(next, after === 2 ? "ren-level-2" : "ren-level-3");
}
