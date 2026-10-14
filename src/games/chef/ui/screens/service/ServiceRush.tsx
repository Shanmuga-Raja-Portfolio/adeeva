import { useEffect, useRef, useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import { HINTS } from "../../../content/hints";
import { STATIONS, type StationId } from "../../../content/station";
import {
  dishById,
  currentBeat,
  hasClock,
  quickSizzle,
  serviceOver,
  staffStepIssue,
  type Action,
  type DishSlot,
  type GameState,
  type QuickRecord,
  type ServiceRun,
} from "../../../core";
import { useKitchenSound } from "../../sound/SoundContext";
import { useAssist } from "../../useAssist";
import { panDone, panNeedsYou, panRecord, startPan, stepPan, type PanSim } from "../cook/panSim";
import { HobPan, HobStart } from "./HobPanel";
import { QuickChop, QuickPass, QuickSimmer, QuickTaste } from "./QuickStations";
import { ServiceHeader } from "./ServiceHeader";
import { serviceHeading } from "./serviceHeading";
import { StoryOverlay } from "../story/StoryOverlay";
import { ServiceResults } from "./ServiceResults";
import { dishInSlot, railView, slotKey, waitingAt, type WaitingDish } from "./serviceView";
import { StaffBench } from "./StaffBench";
import { StationTabs } from "./StationTabs";
import { TicketRail } from "./TicketRail";
import "./service.css";

interface ServiceRushProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const NOTHING_PICKED: Readonly<Record<StationId, string | null>> = {
  board: null,
  hob: null,
  pot: null,
  spice: null,
  pass: null,
};

interface Pan {
  readonly slot: DishSlot;
  readonly sim: PanSim;
  readonly assisted: boolean;
}

function LiveService({
  state,
  service,
  dispatch,
  onExit,
}: ServiceRushProps & { readonly service: ServiceRun }) {
  const { reducedMotion } = useSettings();
  const { play } = useKitchenSound();
  const clocked = hasClock(service);
  const [now, setNow] = useState(service.lastAt);
  const nowRef = useRef(service.lastAt);
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [station, setStation] = useState<StationId>("board");
  const [picked, setPicked] = useState<Readonly<Record<StationId, string | null>>>(NOTHING_PICKED);
  const [pans, setPans] = useState<readonly Pan[]>([]);
  const pansRef = useRef<readonly Pan[]>([]);
  const [heat, setHeat] = useState(3);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [chopAssist] = useAssist("chop");
  const [sizzleAssist] = useAssist("sizzle");
  const [simmerAssist] = useAssist("simmer");
  const [tasteAssist] = useAssist("taste");

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const view = railView(service, now);
  const waiting = Object.fromEntries(STATIONS.map((entry) => [entry, waitingAt(view, entry)])) as Record<
    StationId,
    WaitingDish[]
  >;
  const counts = Object.fromEntries(STATIONS.map((entry) => [entry, waiting[entry].length])) as Record<
    StationId,
    number
  >;
  const panKeys = new Set(pans.map((entry) => slotKey(entry.slot)));
  const active = waiting[station].filter((dish) => station !== "hob" || !panKeys.has(dish.key));
  const chosen = active.find((dish) => dish.key === picked[station]) ?? active[0] ?? null;
  const busy = new Set([...panKeys, chosen === null ? "" : chosen.key]);
  const hobFull = pans.length >= service.plan.pans;

  const moment = () => {
    const at = Math.max(service.lastAt, Math.round(nowRef.current * 100) / 100);
    return clocked ? Math.min(service.plan.lengthSeconds, at) : at;
  };
  const finish = () => {
    if (ending) return;
    if (dispatch({ type: "endService", at: moment() })) setEnding(true);
  };
  const record = (slot: DishSlot, quick: QuickRecord) => {
    if (dispatch({ type: "serviceStep", slot, at: moment(), record: quick })) play("chime");
    setPicked((current) => ({ ...current, [station]: null }));
  };
  const updatePans = (next: readonly Pan[]) => {
    pansRef.current = next;
    setPans(next);
  };

  const storyOpen = currentBeat(state) !== null;
  useTickLoop(!paused && !ending && !storyOpen, (count, seconds) => {
    const next = Math.min(clocked ? service.plan.lengthSeconds : Infinity, nowRef.current + seconds);
    nowRef.current = next;
    setNow(next);
    if (pansRef.current.length > 0) {
      const cooking: Pan[] = [];
      for (const current of pansRef.current) {
        const def = dishInSlot(service, current.slot);
        if (def === null || def.sizzle === null) continue;
        const sim = stepPan(current.sim, quickSizzle(def.sizzle), count);
        if (!panDone(sim)) {
          cooking.push({ ...current, sim });
          continue;
        }
        const quick: QuickRecord = { kind: "sizzle", record: panRecord(sim, current.assisted) };
        if (dispatch({ type: "serviceStep", slot: current.slot, at: moment(), record: quick })) play("chime");
      }
      updatePans(cooking);
    }
    for (const member of service.staff) {
      if (member.station === null) continue;
      const ready = waitingAt(railView(service, next), member.station).find(
        (dish) => !busy.has(dish.key) && staffStepIssue(service, dish.slot, moment()) === null,
      );
      if (ready !== undefined && dispatch({ type: "staffStep", slot: ready.slot, at: moment() }))
        play("tick");
    }
    if (serviceOver(railView(service, next), next)) {
      finish();
      return false;
    }
    return true;
  });

  const chosenDish = chosen === null ? null : dishById(chosen.dishId);
  const alerts: StationId[] = pans.some((entry) => {
    const def = dishInSlot(service, entry.slot);
    return def !== null && def.sizzle !== null && panNeedsYou(entry.sim, quickSizzle(def.sizzle));
  })
    ? ["hob"]
    : [];
  const changePan = (key: string, change: (sim: PanSim) => PanSim) => {
    const next = pansRef.current.map((entry) => {
      if (slotKey(entry.slot) !== key) return entry;
      const sim = change(entry.sim);
      if (sim !== entry.sim) play("flip");
      return { ...entry, sim };
    });
    updatePans(next);
  };
  const startHob = () => {
    if (chosen === null || chosenDish === null || chosenDish.sizzle === null || hobFull) return;
    play("pop");
    const dots = sizzleAssist ? chosenDish.sizzle.idealDots : heat;
    updatePans([
      ...pansRef.current,
      { slot: chosen.slot, sim: startPan(quickSizzle(chosenDish.sizzle), dots), assisted: sizzleAssist },
    ]);
    setPicked((current) => ({ ...current, hob: null }));
  };
  const stationBody = () => {
    if (paused)
      return (
        <div className="ck-service__paused" data-testid="paused">
          <Icon name="clock" size={32} />
          <p>Paused. Everything waits for you.</p>
        </div>
      );
    const hobStart =
      station === "hob" &&
      !hobFull &&
      chosen !== null &&
      chosenDish !== null &&
      chosenDish.sizzle !== null ? (
        <HobStart
          waiting={chosen}
          dish={chosenDish}
          ideal={chosenDish.sizzle.idealDots}
          heat={heat}
          assisted={sizzleAssist}
          onHeat={setHeat}
          onStart={startHob}
        />
      ) : null;
    if (station === "hob" && pans.length > 0)
      return (
        <div className={pans.length > 1 ? "ck-hob-pans ck-hob-pans--two" : "ck-hob-pans"}>
          {pans.map((entry) => {
            const def = dishInSlot(service, entry.slot);
            const key = slotKey(entry.slot);
            return def === null ? null : (
              <HobPan
                key={key}
                dish={def}
                sim={entry.sim}
                assisted={entry.assisted}
                reducedMotion={reducedMotion}
                onChange={(change) => changePan(key, change)}
              />
            );
          })}
          {hobStart}
        </div>
      );
    if (chosen === null || chosenDish === null)
      return (
        <p className="ck-service__idle">
          {active.length === 0
            ? "Nothing waiting here. Check the other stations!"
            : "Pick a dish from Waiting here to start."}
        </p>
      );
    const props = {
      state,
      service,
      dish: chosen,
      reducedMotion,
      onRecord: (quick: QuickRecord) => record(chosen.slot, quick),
    };
    switch (station) {
      case "board":
        return <QuickChop key={chosen.key} {...props} assisted={chopAssist} />;
      case "hob":
        return hobStart;
      case "pot":
        return <QuickSimmer key={chosen.key} {...props} assisted={simmerAssist} />;
      case "spice":
        return <QuickTaste key={chosen.key} {...props} assisted={tasteAssist} />;
      case "pass":
        return <QuickPass key={chosen.key} {...props} assisted={false} />;
    }
  };

  return (
    <main className="ck-service ad-screen" data-testid="service-rush" data-now={now.toFixed(1)}>
      <ServiceHeader
        service={service}
        heading={serviceHeading(state, service)}
        now={now}
        paused={paused}
        reducedMotion={reducedMotion}
        onPause={() => setPaused((value) => !value)}
        onTeamFinish={finish}
        onStepOut={onExit}
      />
      <TicketRail service={view} now={now} clocked={clocked} />
      <div className={paused ? "ck-service__floor ck-service__floor--paused" : "ck-service__floor"}>
        <section className="ck-service__station" aria-label={`${station} station`}>
          {stationBody()}
        </section>
        <aside className="ck-service__side">
          <p className="ck-service__hint">
            <span className="ad-eyebrow">Chef's tip</span> {HINTS.service}
          </p>
          <div className="ck-queue" role="group" aria-label="Waiting here">
            <span className="ad-eyebrow">Waiting here</span>
            {active.length === 0 ? <p className="ck-muted">Nothing yet.</p> : null}
            {active.map((dish) => (
              <button
                key={dish.key}
                type="button"
                className={chosen?.key === dish.key ? "ck-queue__chip ck-queue__chip--on" : "ck-queue__chip"}
                onClick={() => setPicked((current) => ({ ...current, [station]: dish.key }))}
                disabled={paused || (station === "hob" && hobFull)}
                data-testid={`queue-${dish.key}`}
              >
                <strong>T{dish.table}</strong> {dish.dishName}
              </button>
            ))}
          </div>
          <StaffBench
            service={service}
            trait={state.profile.trait}
            assigning={assigning}
            onAssigning={setAssigning}
            onAssign={(staffId, target) => {
              dispatch({ type: "assignStaff", staffId, station: target });
              setAssigning(null);
            }}
          />
          {service.special !== null ? (
            <div className="ck-special-chalk">
              <span className="ad-eyebrow">Today's special</span>
              <span className="ck-chalk">{dishById(service.special.dishId).name}</span>
              <span>{service.special.price} coins a plate</span>
            </div>
          ) : null}
        </aside>
      </div>
      <StoryOverlay state={state} dispatch={dispatch} />
      <StationTabs
        service={service}
        active={station}
        counts={counts}
        alerts={alerts}
        reducedMotion={reducedMotion}
        assigning={assigning}
        onPick={(target) => {
          if (assigning !== null) {
            dispatch({ type: "assignStaff", staffId: assigning, station: target });
            setAssigning(null);
            return;
          }
          setStation(target);
        }}
      />
    </main>
  );
}

export function ServiceRush({ state, dispatch, onExit }: ServiceRushProps) {
  const service = state.service;
  if (service === null) return <ServiceResults state={state} onExit={onExit} />;
  return <LiveService key={service.id} state={state} service={service} dispatch={dispatch} onExit={onExit} />;
}
