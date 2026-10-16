import { useState } from "react";
import {
  homeStoryById,
  plotById,
  purposeById,
  type Action,
  type GameState,
  type OpenHouseRecord,
} from "../../../core";
import type { StripRoom } from "./HomeStrip";
import { OpenHouseResults } from "./OpenHouseResults";
import { OpenHouseShow } from "./OpenHouseShow";
import "./openHouse.css";

export interface OpenHouseScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

function stripRooms(state: GameState, record: OpenHouseRecord): StripRoom[] {
  const project = state.larkspur?.project ?? null;
  if (project === null || project.plotId !== record.plotId || project.stage !== "done") return [];
  const hall = project.map.spaces.indexOf("hall");
  const order = [...(hall >= 0 ? [hall] : []), ...record.plan.tour];
  return order.flatMap((index) => {
    const run = project.rooms[index];
    const purposeId = project.map.spaces[index];
    if (run === undefined || run === null || purposeId === undefined || purposeId === null) return [];
    return [{ run, label: purposeById(purposeId).name }];
  });
}

export function OpenHouseScreen({ state, dispatch, onExit }: OpenHouseScreenProps) {
  const record = state.larkspur?.history[state.larkspur.history.length - 1];
  const rooms = record === undefined ? [] : stripRooms(state, record);
  const fresh = record !== undefined && !record.auto && record.day === state.calendar.day && rooms.length > 0;
  const [phase, setPhase] = useState<"show" | "results">(fresh ? "show" : "results");
  if (record === undefined) return null;
  if (phase === "show" && rooms.length > 0)
    return (
      <OpenHouseShow
        record={record}
        plot={plotById(record.plotId)}
        story={homeStoryById(record.storyId)}
        rooms={rooms}
        designer={state.profile.name}
        onDone={() => setPhase("results")}
      />
    );
  return (
    <OpenHouseResults
      state={state}
      record={record}
      dispatch={dispatch}
      onReplay={rooms.length > 0 ? () => setPhase("show") : null}
      onExit={onExit}
    />
  );
}
