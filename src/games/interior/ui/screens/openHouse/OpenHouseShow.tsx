import { useEffect, useRef, type CSSProperties } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { PetalFall } from "../../../../../ui/art/PetalFall";
import { easeOut, window01 } from "../../../../../ui/kit/easing";
import { MusicChip } from "../../../../adeeva/ui/screens/label/MusicChip";
import { progressPips, sceneLabel, type ShowMoment } from "../../../../adeeva/ui/screens/label/showTimeline";
import { useShowPlayback } from "../../../../adeeva/ui/screens/label/useShowPlayback";
import "../../../../adeeva/ui/screens/label/show.css";
import type { HomeStoryDef } from "../../../content/homeStory";
import type { PlotDef } from "../../../content/plot";
import { TOUR_MUSIC } from "../../../content/tourMusic";
import { TOUR_TIMES } from "../../../content/tourTime";
import { VISITOR_LOOKS } from "../../../content/visitor";
import { keyById, verdictFor, type OpenHouseRecord } from "../../../core";
import { KeyArt } from "../../art/KeyArt";
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
import { roomHex } from "../../art/roomHex";
import { HomeStrip, type StripRoom } from "./HomeStrip";

export interface OpenHouseShowProps {
  readonly record: OpenHouseRecord;
  readonly plot: PlotDef;
  readonly story: HomeStoryDef;
  readonly rooms: readonly StripRoom[];
  readonly designer: string;
  readonly onDone: () => void;
}

function OpenHouseTitle({
  t,
  still,
  plot,
  story,
  designer,
}: {
  t: number;
  still: boolean;
  plot: PlotDef;
  story: HomeStoryDef;
  designer: string;
}) {
  const line = (start: number): CSSProperties => {
    if (still) return { opacity: 1 };
    const enter = easeOut(window01(t, start, start + 0.18));
    return {
      opacity: enter * (1 - window01(t, 0.88, 1)),
      transform: `translateY(${((1 - enter) * 16).toFixed(1)}px)`,
    };
  };
  const door = still ? 1 : easeOut(window01(t, 0.45, 0.8));
  return (
    <div className="ad-show-title is-oh-title" data-testid="show-title">
      <span className="ad-show-title__eyebrow" style={line(0.04)}>
        Bellwind Homes presents
      </span>
      <h1 className="ad-show-title__name" style={line(0.14)}>
        Open House
      </h1>
      <span className="ad-show-title__venue" style={line(0.3)}>
        at No. {plot.number} Larkspur Close
      </span>
      <div className="is-oh-title__door" aria-hidden="true">
        <span className="is-oh-title__frame" style={{ background: plot.door }}>
          <span
            className="is-oh-title__leaf"
            style={{
              background: plot.door,
              transform: `perspective(400px) rotateY(${(-door * 70).toFixed(1)}deg)`,
            }}
          />
          <span className="is-oh-title__light" style={{ opacity: door }} />
        </span>
      </div>
      <span className="ad-show-title__by" style={line(0.55)}>
        {story.name} · designed by {designer}
      </span>
    </div>
  );
}

function Caption({
  moment,
  rooms,
  record,
}: {
  moment: ShowMoment;
  rooms: readonly StripRoom[];
  record: OpenHouseRecord;
}) {
  const kind = moment.segment.kind;
  if (kind === "walk") {
    const room = rooms[moment.segment.walk];
    if (room === undefined) return null;
    const last = moment.segment.walk === rooms.length - 1;
    return (
      <div className="ad-show-caption" data-testid="show-caption">
        <span className="ad-show-caption__count">
          Room {moment.segment.walk + 1} of {rooms.length}
          {last ? " · the grand finale" : ""}
        </span>
        <span className="ad-show-caption__title">{room.label}</span>
        <span className="ad-show-caption__detail">The visitors stroll in and look around</span>
      </div>
    );
  }
  if (kind === "finale")
    return (
      <div className="ad-show-caption ad-show-caption--centre" data-testid="show-caption">
        <span className="ad-show-caption__count">No peeking… then before and after</span>
        <span className="ad-show-caption__title">The whole home, from empty to welcoming</span>
      </div>
    );
  if (kind === "bow")
    return (
      <div className="ad-show-caption ad-show-caption--centre" data-testid="show-caption">
        <span className="ad-show-caption__count">{verdictFor(record.overall)}</span>
        <span className="ad-show-caption__title">{keyById(record.keyId).name}</span>
      </div>
    );
  return null;
}

function Frame({
  moment,
  still,
  opacity,
  props,
}: {
  moment: ShowMoment;
  still: boolean;
  opacity: number;
  props: OpenHouseShowProps;
}) {
  const { record, plot, story, rooms } = props;
  const kind = moment.segment.kind;
  const evening = record.plan.time === "evening";
  const petals = story.palette.map((colour) => roomHex(colour));
  return (
    <div className="ad-show__frame" style={{ opacity }}>
      {kind === "title" ? (
        <OpenHouseTitle t={moment.t} still={still} plot={plot} story={story} designer={props.designer} />
      ) : (
        <div className="ad-show__stage is-oh-stage">
          <LarkspurBackdrop
            className="ad-show__runway is-oh-stage__street"
            time={record.plan.time}
            plot={plot.number}
            openSign
          />
          {kind === "walk" || kind === "finale" ? (
            <HomeStrip
              rooms={rooms}
              focus={kind === "walk" ? moment.segment.walk : 0}
              t={moment.t}
              still={still}
              evening={evening}
              finale={kind === "finale"}
              reveal={still ? 1 : easeOut(window01(moment.t, 0.3, 0.75))}
              visitors={VISITOR_LOOKS}
              story={story}
            />
          ) : null}
          {kind === "bow" ? (
            <div className="is-oh-bow" data-testid="show-key">
              <span className="is-oh-bow__sign">Welcome home</span>
              <KeyArt keyId={record.keyId} size={180} />
              <strong className="is-oh-bow__score">{record.overall}</strong>
            </div>
          ) : null}
          {(kind === "finale" && (still || moment.t > 0.6)) || kind === "bow" ? (
            <svg
              className="ad-show__figures"
              viewBox="0 0 1600 940"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <PetalFall
                t={still ? 0.5 : kind === "bow" ? moment.t + 0.4 : moment.t - 0.6}
                colours={petals}
              />
            </svg>
          ) : null}
        </div>
      )}
      <Caption moment={moment} rooms={rooms} record={record} />
    </div>
  );
}

export function OpenHouseShow(props: OpenHouseShowProps) {
  const { reducedMotion } = useSettings();
  const { segments, elapsed, moment, frames } = useShowPlayback(
    props.rooms.length,
    reducedMotion,
    props.onDone,
  );
  const skipRef = useRef<HTMLButtonElement | null>(null);
  const firstWalk = segments.findIndex((segment) => segment.kind === "walk");
  const canSkip = moment.index > firstWalk;
  useEffect(() => {
    if (canSkip) skipRef.current?.focus({ preventScroll: true });
  }, [canSkip]);
  const music = TOUR_MUSIC.find((entry) => entry.id === props.record.plan.music);
  const time = TOUR_TIMES.find((entry) => entry.id === props.record.plan.time);
  const pips = progressPips(segments);
  const activePip = pips.indexOf(moment.segment);
  return (
    <div
      className="ad-show is-oh-show"
      role="region"
      aria-label={`Open House at No. ${props.plot.number} Larkspur Close`}
      data-testid="open-house-show"
      data-scene={sceneLabel(moment.segment)}
      style={{ "--show-glow": time?.glow ?? "#ffe39c", "--show-accent": props.plot.door } as CSSProperties}
    >
      <div className="ad-show__screen">
        {frames.map((frame) => (
          <Frame
            key={frame.moment.index}
            moment={frame.moment}
            still={reducedMotion}
            opacity={frame.opacity}
            props={props}
          />
        ))}
      </div>
      <div className="ad-show__hud">
        <MusicChip
          name={`${music?.name ?? "Music"} · ${time?.name ?? ""}`}
          elapsed={elapsed}
          playing={!reducedMotion}
        />
        <ol className="ad-show__pips" aria-label="Open House progress">
          {pips.map((segment, index) => (
            <li
              key={sceneLabel(segment)}
              className={index === activePip ? "is-active" : index < activePip ? "is-done" : ""}
            >
              <span className="ad-visually-hidden">{sceneLabel(segment)}</span>
            </li>
          ))}
        </ol>
        {canSkip ? (
          <button
            ref={skipRef}
            type="button"
            className="ad-show__skip"
            onClick={props.onDone}
            data-testid="skip-show"
          >
            Skip to the panels ›
          </button>
        ) : null}
      </div>
    </div>
  );
}
