import { useMemo } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { PetalFall } from "../../../../../ui/art/PetalFall";
import { Button } from "../../../../../ui/kit/Button";
import { easeInOut, easeOut, window01 } from "../../../../../ui/kit/easing";
import { useShowClock } from "../../../../../ui/kit/useShowClock";
import { MusicChip } from "../../../../../ui/show/MusicChip";
import { PanelFlips } from "../../../../../ui/show/PanelFlips";
import {
  restX,
  revealedSlots,
  revealSteps,
  type RevealStep,
  type RevealTimings,
} from "../../../../../ui/show/revealSteps";
import { useRevealSteps } from "../../../../../ui/show/useRevealSteps";
import { MUSIC_MOODS } from "../../../../../engine/musicMood";
import { jewelColourById } from "../../../content/jewelColour";
import type { LaunchThemeDef } from "../../../content/launchTheme";
import {
  awardById,
  lanternById,
  optionById,
  productById,
  seasonByNumber,
  type CollectionPiece,
  type CollectionState,
  type LaunchResult,
} from "../../../core";
import { LanternBeam } from "../../art/LanternBeam";
import { LanternGarland, type GarlandLight } from "../../art/LanternGarland";
import { LanternSlide } from "../../art/LanternSlide";
import { LanternStage } from "../../art/LanternStage";
import { LightThread } from "../../art/LightThread";
import { MusicBoxPlinth } from "../../art/MusicBoxPlinth";
import { PiecePreview } from "../../art/PiecePreview";
import { ShowcaseHalo } from "../../art/ShowcaseHalo";
import { PANEL_LOOKS } from "./panelLooks";
import "./reveal.css";

export interface LanternLaunchProps {
  readonly result: LaunchResult;
  readonly collection: CollectionState;
  readonly theme: LaunchThemeDef;
  readonly garland: readonly GarlandLight[];
  readonly crowd: readonly { readonly name: string; readonly look: AvatarLook }[];
  readonly skippable: boolean;
  readonly onDone: () => void;
}

const TIMINGS: RevealTimings = {
  motion: { title: 2600, lights: 1800, glide: 1400, wait: 3000, reveal: 1800, finale: 4200, panels: 4400 },
  still: { title: 2200, lights: 0, glide: 0, wait: 3000, reveal: 1800, finale: 3000, panels: 3800 },
  lights: true,
};

const PLINTH_Y = 470;
const PIECE_SIZE = 240;
const REST_Y = 500;

function caption(
  step: RevealStep,
  piece: CollectionPiece | undefined,
  motif: string,
  theme: LaunchThemeDef,
): string {
  const name = piece === undefined ? "piece" : productById(piece.look.productId).name;
  switch (step.kind) {
    case "title":
      return `Welcome to Lantern Night: ${theme.name}!`;
    case "lights":
      return "The lantern strings brighten, row by row…";
    case "glide":
      return "Mr. Osei winds the music box…";
    case "wait":
      return "Tap the lid, or wait, and it opens by itself!";
    case "reveal":
      return `${name} · ${motif} motif`;
    case "finale":
      return "A thread of light runs piece to piece. The arcade lifts its lanterns!";
    case "panels":
      return "The four panels share their notes…";
  }
}

interface StepViewProps extends Omit<LanternLaunchProps, "skippable"> {
  readonly steps: readonly RevealStep[];
  readonly index: number;
  readonly reduced: boolean;
  readonly canSkip: boolean;
  readonly onNext: () => void;
}

function pieceSvg(piece: CollectionPiece, size: number, twinkle: boolean) {
  return (
    <svg x={-size / 2} y={-size} width={size} height={size} overflow="visible">
      <PiecePreview source={piece.look} title={null} velvet={false} twinkle={twinkle} />
    </svg>
  );
}

function StepView({
  steps,
  index,
  reduced,
  canSkip,
  onNext,
  onDone,
  result,
  collection,
  theme,
  garland,
  crowd,
}: StepViewProps) {
  const step = steps[index] ?? steps[steps.length - 1];
  const elapsed = useShowClock(step?.ms ?? 1, onNext);
  if (step === undefined) return null;
  const raw = step.ms === 0 ? 1 : Math.min(1, elapsed / step.ms);
  const t = reduced ? 1 : raw;
  const order = result.plan.order;
  const pieces = order.flatMap((id) => collection.pieces.filter((piece) => piece.id === id));
  const count = order.length;
  const revealed = revealedSlots(steps, index);
  const lantern = lanternById(result.plan.lantern);
  const motif = collection.brief === null ? "" : optionById(collection.brief.motif).name;
  const onPlinth = step.kind === "glide" || step.kind === "wait" || step.kind === "reveal";
  const current = onPlinth ? pieces[step.slot] : undefined;
  const page =
    current === undefined
      ? undefined
      : collection.lookbook.pages.find((entry) => entry.pieceId === current.id);
  const lights = step.kind === "title" ? 0.1 * t : step.kind === "lights" ? easeOut(t) : 1;
  const rise = step.kind === "glide" ? easeInOut(t) : 1;
  const wind = step.kind === "glide" || step.kind === "wait" ? raw : 0;
  const lid = step.kind === "reveal" ? easeOut(window01(t, 0, 0.3)) : 0;
  const lift = step.kind === "reveal" ? easeOut(window01(t, 0.1, 0.5)) : 0;
  const slide = step.kind === "reveal" ? window01(t, 0.15, 0.45) : 0;
  const sweep = step.kind === "reveal" && !reduced ? window01(raw, 0.3, 0.95) : 0;
  const glint = step.kind === "reveal" ? (page?.light ?? 0.3) * window01(t, 0.4, 0.8) : 0;
  const finale = step.kind === "finale" || step.kind === "panels";
  const thread = step.kind === "finale" ? easeInOut(window01(t, 0, 0.5)) : step.kind === "panels" ? 1 : 0;
  const stars = finale && !reduced ? (step.kind === "finale" ? raw : 1 + raw) * 0.9 : -1;
  const harmony = result.panels.find((panel) => panel.id === "harmony")?.score ?? 0;
  const rests = revealed.map((slot) => ({ slot, x: (restX(slot, count) / 100) * 1200, y: REST_Y }));
  const award = awardById(result.award);
  const lit = finale && step.kind === "finale" ? window01(t, 0.5, 0.9) : finale ? 1 : 0;
  const music = MUSIC_MOODS.find((entry) => entry.id === result.plan.music)?.name ?? "Music";
  const shownGarland = garland.map((light) =>
    light.id === result.themeId ? { ...light, hex: lit > 0.5 ? award.colour : null } : light,
  );
  return (
    <div className="jb-launch-reveal__stage" data-step={step.kind} data-slot={step.slot}>
      <div className="jb-launch-reveal__frame">
        <svg
          className="jb-launch-reveal__art"
          viewBox="0 0 1200 640"
          role="img"
          aria-label={caption(step, current, motif, theme)}
        >
          <LanternStage dusk={seasonByNumber(result.seasonNumber).dusk} lights={lights} lantern={lantern.hex}>
            {current !== undefined ? (
              <LanternSlide
                page={page}
                piece={current.look}
                lantern={lantern.hex}
                glow={lantern.glow}
                shown={slide * 0.6}
              />
            ) : null}
          </LanternStage>
          {finale ? (
            <LanternGarland
              lights={shownGarland}
              width={760}
              sag={34}
              size={30}
              x={220}
              y={18}
              highlight={result.themeId}
            />
          ) : null}
          <LanternBeam sweep={sweep} glow={lantern.glow} />
          {rests.map((rest) => {
            const piece = pieces[rest.slot];
            if (piece === undefined) return null;
            return (
              <g
                key={rest.slot}
                transform={`translate(${rest.x} ${rest.y})`}
                className="jb-launch-reveal__rest"
              >
                <rect
                  x={-34}
                  y={-6}
                  width={68}
                  height={14}
                  rx={4}
                  fill="#e8c27a"
                  stroke="#8f6e10"
                  strokeWidth={2}
                />
                {pieceSvg(piece, 120, false)}
              </g>
            );
          })}
          <LightThread
            points={rests.map((rest) => ({ x: rest.x, y: rest.y - 60 }))}
            drawn={thread}
            brightness={harmony / 100}
            glow={lantern.glow}
          />
          {current !== undefined ? (
            <g
              transform={`translate(0 ${(1 - rise) * 180})`}
              opacity={step.kind === "glide" ? Math.min(1, raw * 3) : 1}
            >
              <MusicBoxPlinth
                x={600}
                y={PLINTH_Y}
                lid={lid}
                wind={wind}
                rise={lift}
                notes={!reduced && (step.kind === "glide" || step.kind === "wait")}
              >
                {lid > 0.2 ? (
                  <>
                    <ShowcaseHalo size={PIECE_SIZE} glow={lantern.glow} />
                    {pieceSvg(current, PIECE_SIZE, !reduced)}
                  </>
                ) : null}
              </MusicBoxPlinth>
              {glint > 0 ? (
                <g transform={`translate(712 ${PLINTH_Y - 330})`} className="jb-launch-reveal__glint">
                  <path
                    d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30 Z"
                    fill="#ffffff"
                    opacity={glint}
                    transform={`scale(${0.35 + glint * 0.5})`}
                  />
                </g>
              ) : null}
            </g>
          ) : null}
          {stars >= 0 ? (
            <PetalFall
              t={stars}
              colours={[
                "#fff3c8",
                lantern.glow,
                "#f6d27a",
                ...theme.palette.map((id) => jewelColourById(id).hex),
              ]}
              width={1200}
              height={640}
              shape="star"
            />
          ) : null}
        </svg>
        {step.kind === "wait" ? (
          <button
            type="button"
            className="jb-launch-reveal__lid-tap"
            onClick={onNext}
            tabIndex={-1}
            aria-label="Open the lid"
            data-testid="music-box"
          />
        ) : null}
        <div
          className={
            finale ? "jb-launch-reveal__crowd jb-launch-reveal__crowd--clap" : "jb-launch-reveal__crowd"
          }
          aria-hidden="true"
        >
          {crowd.map((member, at) => (
            <span key={member.name} style={{ animationDelay: `${(at % 4) * 120}ms` }}>
              <Avatar
                look={member.look}
                mood={finale ? "delighted" : "happy"}
                size={56}
                title={member.name}
              />
              {finale ? (
                <span className="jb-launch-reveal__paper-lantern" style={{ background: lantern.hex }} />
              ) : null}
            </span>
          ))}
        </div>
        {step.kind === "title" ? (
          <div className="jb-launch-reveal__title" style={{ opacity: reduced ? 1 : Math.min(1, raw * 3) }}>
            <span className="ad-eyebrow">Lantern Night · Thimble Lane Arcade</span>
            <h2>{theme.name}</h2>
            <p>“{theme.cards[result.plan.card] ?? ""}”</p>
          </div>
        ) : null}
        {step.kind === "wait" ? (
          <button
            type="button"
            className="jb-launch-reveal__open"
            onClick={onNext}
            autoFocus
            data-testid="open-lid"
          >
            Open the lid
          </button>
        ) : null}
      </div>
      {step.kind === "panels" ? (
        <PanelFlips
          panels={result.panels}
          iconOf={(id) => PANEL_LOOKS[id].icon}
          instant={reduced}
          block="jb-flip"
        />
      ) : null}
      {step.kind === "title" || step.kind === "panels" ? null : (
        <p className="jb-launch-reveal__caption" aria-live="polite">
          {caption(step, current, motif, theme)}
        </p>
      )}
      {step.kind === "finale" && lit > 0.5 ? (
        <p className="jb-launch-reveal__award" role="status">
          {theme.name}'s lantern glows: {award.name}!
        </p>
      ) : null}
      <div className="jb-launch-reveal__hud">
        <MusicChip name={music} elapsed={elapsed + index * 997} playing={!reduced} />
        <ol className="jb-launch-reveal__pips" aria-label="Launch progress">
          {steps.map((_, at) => (
            <li key={at} className={at === index ? "is-active" : at < index ? "is-done" : ""} />
          ))}
        </ol>
        {canSkip ? (
          <Button variant="secondary" size="sm" onClick={onDone} data-testid="skip-launch">
            Skip to the lanterns ›
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LanternLaunch({ skippable, ...props }: LanternLaunchProps) {
  const { result, onDone } = props;
  const { reducedMotion } = useSettings();
  const steps = useMemo(
    () => revealSteps(result.plan.order.length, reducedMotion, TIMINGS),
    [result.plan.order.length, reducedMotion],
  );
  const { index, step, next, canSkip } = useRevealSteps(steps, skippable, onDone);
  return (
    <section
      className={reducedMotion ? "jb-launch-reveal jb-launch-reveal--still" : "jb-launch-reveal"}
      aria-label="Lantern Night Launch"
      data-testid="lantern-launch"
      data-scene={step === undefined ? "done" : `${step.kind}${step.slot >= 0 ? `-${step.slot + 1}` : ""}`}
    >
      <StepView
        key={index}
        steps={steps}
        index={index}
        reduced={reducedMotion}
        canSkip={canSkip}
        onNext={next}
        {...props}
      />
    </section>
  );
}
