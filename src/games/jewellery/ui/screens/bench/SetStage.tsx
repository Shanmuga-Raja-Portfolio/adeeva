import { useState } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { jewelColourById } from "../../../content/jewelColour";
import { productById, runSeats, seatCut, setTolerance, startPose, stoneById } from "../../../core";
import { tintedHex } from "../../art/pieceArtProps";
import { CelebrationBurst } from "../../art/CelebrationBurst";
import { metalLook } from "../../art/metalLook";
import { useAssist } from "../../useAssist";
import { PotPicker } from "./PotPicker";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import { StoneBench } from "./StoneBench";
import "./set.css";

export function SetStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const [assist, setAssist] = useAssist("set");
  const [redo, setRedo] = useState<string | null>(null);
  const seats = runSeats(run);
  const product = productById(run.design.productId);
  const firstOpen = seats.find((seat) => !Object.hasOwn(run.sets, seat)) ?? null;
  const activeKey = redo ?? firstOpen;
  const stoneId = run.design.stoneId;
  const metalId = run.design.metalId;
  const part = product.parts.find((entry) => entry.key === activeKey);
  const cut = seatCut(run.design);
  const done = seats.filter((seat) => Object.hasOwn(run.sets, seat)).length;
  const collection = run.purpose.kind === "collection" ? state.collection : null;
  const potReady = collection === null || run.potStones.length === seats.length;
  const potIndex = activeKey === null ? undefined : run.potStones[seats.indexOf(activeKey)];
  const potStone = collection === null || potIndex === undefined ? undefined : collection.stonePot[potIndex];
  const baseHex = stoneId === null ? "#ffffff" : jewelColourById(stoneById(stoneId).colour).hex;
  return (
    <div className="jb-set">
      <div className="jb-work">
        <aside className="jb-work__list jb-measure">
          <header>
            <strong>Stones to set</strong>
            <span className="jb-muted">
              {" "}
              {done}/{seats.length} set
            </span>
          </header>
          <ul>
            {seats.map((seat) => {
              const record = run.sets[seat];
              const name = product.parts.find((entry) => entry.key === seat)?.name ?? seat;
              return (
                <li key={seat}>
                  <button
                    type="button"
                    className="jb-work__item"
                    aria-pressed={seat === activeKey}
                    onClick={() => setRedo(seat)}
                  >
                    <span>{name}</span>
                    <span className="jb-work__state">
                      {record !== undefined ? (
                        <>
                          <Icon name="check" size={14} /> {Math.round(record.accuracy * 100)}% · Redo
                        </>
                      ) : (
                        "To set"
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {collection !== null ? (
            <PotPicker collection={collection} run={run} seats={seats.length} dispatch={dispatch} />
          ) : null}
          <ToggleSwitch
            label="Gentle tweezers"
            description="The stone snaps in and the claws close."
            checked={assist}
            onChange={setAssist}
          />
          <p className="jb-hint">{assistHint("the gentle tweezers")}</p>
        </aside>
        <div className="jb-work__stage">
          <CelebrationBurst key={done} active={done > 0} />
          {!potReady ? (
            <div className="jb-work__done">
              <Icon name="sparkle" size={32} />
              <p>Pick stones from your Line Pot first.</p>
            </div>
          ) : activeKey !== null && part !== undefined && stoneId !== null && metalId !== null ? (
            <StoneBench
              key={`${activeKey}-${redo ?? "new"}-${assist ? "tweezers" : "hand"}-${run.potStones.join(".")}`}
              cut={cut}
              hex={tintedHex(baseHex, potStone?.tint)}
              stoneMm={part.width * 0.8}
              start={startPose(run.seed, seats.indexOf(activeKey), cut)}
              tolerance={setTolerance(state)}
              assisted={assist}
              metal={metalLook(metalId, "high-shine")}
              onSet={(pose, claws) => {
                if (dispatch({ type: "setStone", seatKey: activeKey, ...pose, claws, assisted: assist }))
                  setRedo(null);
              }}
            />
          ) : (
            <div className="jb-work__done">
              <Icon name="sparkle" size={32} />
              <p>Every stone is snug in its claws!</p>
            </div>
          )}
        </div>
      </div>
      <StageFooter {...props} ready="Stones are set. Time to polish!" />
    </div>
  );
}
