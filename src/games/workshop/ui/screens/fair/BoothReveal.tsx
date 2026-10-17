import { useMemo, type CSSProperties } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { PetalFall } from "../../../../../ui/art/PetalFall";
import { Button } from "../../../../../ui/kit/Button";
import { easeInOut, easeOut, window01 } from "../../../../../ui/kit/easing";
import { useShowClock } from "../../../../../ui/kit/useShowClock";
import { REN } from "../../../content/apprentice";
import type { FairThemeDef } from "../../../content/fairTheme";
import { FAIR_PANELS, HATTIE_LOOK, PELL_LOOK } from "../../../content/panelMember";
import {
  clientById,
  currentSeason,
  fairBoothByNumber,
  fairMusicById,
  makersNoteById,
  productById,
  setTemplateById,
  shadeById,
  type FairResult,
  type FloorSet,
  type ShowroomState,
} from "../../../core";
import { DustSheet } from "../../art/DustSheet";
import { GreenBackdrop } from "../../art/GreenBackdrop";
import { HomeProps } from "../../art/HomeProps";
import { PaddedTrolley } from "../../art/PaddedTrolley";
import { floorLooks, type PieceLook } from "../../art/pieceLook";
import { PiecePreview } from "../../art/PiecePreview";
import { PanelFlips } from "../../../../../ui/show/PanelFlips";
import { FairCrowd } from "./FairCrowd";
import { PANEL_LOOKS } from "./panelLooks";
import { REVEAL_TIMINGS } from "./revealSteps";
import { restX, revealedSlots, revealSteps, type RevealStep } from "../../../../../ui/show/revealSteps";
import { useRevealSteps } from "../../../../../ui/show/useRevealSteps";
import "./reveal.css";

export interface BoothRevealProps {
  readonly theme: FairThemeDef;
  readonly result: FairResult;
  readonly set: FloorSet;
  readonly showroom: ShowroomState;
  readonly upgrades: readonly string[];
  readonly replay: boolean;
  readonly onDone: () => void;
}

const SPARKLES = Array.from({ length: 10 }, (_, index) => index);

const SCENE_LABELS: Readonly<Record<RevealStep["kind"], string>> = {
  title: "Welcome",
  lights: "Lights up",
  glide: "Here it comes",
  wait: "Lift the sheet",
  reveal: "The reveal",
  finale: "Finale",
  panels: "The panels",
};

function PieceOnStage({
  look,
  sheet,
  lift,
  dressed,
  sparkle,
}: {
  look: PieceLook;
  sheet: boolean;
  lift: number;
  dressed: boolean;
  sparkle: number;
}) {
  return (
    <svg viewBox="0 0 400 310" className="ww-reveal__piece-art" aria-hidden="true">
      <PaddedTrolley />
      <PiecePreview look={look} title={null} />
      {dressed ? (
        <svg viewBox="0 0 400 300" width={400} height={300}>
          <HomeProps productId={look.productId} />
        </svg>
      ) : null}
      {sheet ? (
        <g
          style={
            { transform: `translateY(${(-lift * 260).toFixed(1)}px)`, opacity: 1 - lift } as CSSProperties
          }
        >
          <DustSheet />
        </g>
      ) : null}
      {sparkle > 0 ? (
        <g transform="translate(200 160)">
          {SPARKLES.map((index) => {
            const angle = (index / SPARKLES.length) * Math.PI * 2;
            const radius = 40 + 120 * sparkle;
            return (
              <path
                key={index}
                d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z"
                fill={index % 2 === 0 ? "#ffe08a" : "#ffffff"}
                opacity={1 - sparkle * 0.8}
                transform={`translate(${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius * 0.6).toFixed(1)}) scale(${(1 + sparkle).toFixed(2)})`}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}

interface StepViewProps {
  readonly steps: readonly RevealStep[];
  readonly index: number;
  readonly reduced: boolean;
  readonly onNext: () => void;
  readonly theme: FairThemeDef;
  readonly result: FairResult;
  readonly set: FloorSet;
  readonly looks: readonly PieceLook[];
  readonly sky: string;
  readonly awning: boolean;
}

function sceneName(step: RevealStep): string {
  return step.kind === "reveal" ? "lift" : step.kind;
}

function caption(step: RevealStep, name: string, theme: FairThemeDef): string {
  switch (step.kind) {
    case "title":
    case "lights":
      return `Welcome to the Larkspur Craft Fair: ${theme.name}!`;
    case "glide":
      return `Here comes the ${name}, under its dust sheet…`;
    case "wait":
      return "Tap the dust sheet to lift it!";
    case "reveal":
      return `The ${name}! The green gasps.`;
    case "finale":
      return "Leaves twirl down and the whole green claps!";
    case "panels":
      return "The four panels share their notes…";
  }
}

function StepView({ steps, index, reduced, onNext, theme, result, set, looks, sky, awning }: StepViewProps) {
  const step = steps[index] ?? steps[steps.length - 1];
  const elapsed = useShowClock(step?.ms ?? 1, onNext);
  if (step === undefined) return null;
  const t = step.ms === 0 ? 1 : elapsed / step.ms;
  const order = result.plan.order;
  const count = order.length;
  const revealed = revealedSlots(steps, index);
  const onTrolley = step.kind === "glide" || step.kind === "wait" || step.kind === "reveal";
  const currentPiece = onTrolley ? order[step.slot] : undefined;
  const currentLook = currentPiece === undefined ? undefined : looks[currentPiece];
  const target = restX(step.slot, count);
  const glideX = step.kind === "glide" ? -20 + (target + 20) * easeInOut(t) : target;
  const lift = step.kind === "reveal" ? easeOut(window01(t, 0, 0.55)) : 0;
  const sparkle = step.kind === "reveal" ? window01(t, 0.2, 1) : 0;
  const clapping = step.kind === "finale" || step.kind === "panels";
  const leaves = clapping && !reduced ? (step.kind === "finale" ? t : 1 + t) * 0.9 : -1;
  const glow = step.kind === "title" ? easeOut(t) : 1;
  const visitor = clientById(result.visitor);
  const palette = [...theme.palette.map((id) => shadeById(id).hex), "#e9a23b", "#c0574a"];
  const crowd = [
    ...FAIR_PANELS.flatMap((panel) => panel.members),
    { name: REN.name, look: REN.look },
    ...(visitor === undefined ? [] : [{ name: visitor.name, look: visitor.look }]),
  ].filter((member, index, all) => all.findIndex((other) => other.name === member.name) === index);
  const currentName =
    currentPiece === undefined
      ? "piece"
      : productById(set.pieces[currentPiece]?.productId ?? "birdhouse").name;
  return (
    <div className="ww-reveal__stage" data-step={step.kind} data-slot={step.slot}>
      <GreenBackdrop
        className="ww-reveal__backdrop"
        backdrop={result.plan.backdrop}
        sky={sky}
        awning={awning}
        glow={glow}
      />
      {revealed.map((slot) => {
        const pieceIndex = order[slot];
        const look = pieceIndex === undefined ? undefined : looks[pieceIndex];
        if (look === undefined) return null;
        return (
          <div
            key={slot}
            className="ww-reveal__piece ww-reveal__piece--rest"
            style={{ left: `${restX(slot, count)}%` }}
          >
            <span className="ww-reveal__halo" aria-hidden="true" />
            <PieceOnStage look={look} sheet={false} lift={1} dressed sparkle={0} />
            <span className="ww-reveal__plate">
              {productById(set.pieces[pieceIndex ?? 0]?.productId ?? "birdhouse").name}
            </span>
          </div>
        );
      })}
      {currentLook !== undefined ? (
        <div
          className="ww-reveal__piece ww-reveal__piece--moving"
          style={{ left: `${reduced ? target : glideX}%` }}
        >
          <PieceOnStage
            look={currentLook}
            sheet={step.kind !== "reveal" || lift < 1}
            lift={lift}
            dressed={step.kind === "reveal" && lift > 0.6}
            sparkle={sparkle}
          />
          {step.kind === "glide" ? (
            <div className="ww-reveal__volunteers" aria-hidden="true">
              <Avatar look={HATTIE_LOOK} mood="happy" size={70} title="Hattie Rowe" />
              <Avatar look={PELL_LOOK} mood="happy" size={70} title="Mr. Pell" />
            </div>
          ) : null}
          {step.kind === "wait" ? (
            <button
              type="button"
              className="ww-reveal__sheet-tap"
              onClick={onNext}
              tabIndex={-1}
              aria-label="Lift the dust sheet"
              data-testid="dust-sheet"
            />
          ) : null}
        </div>
      ) : null}
      {leaves >= 0 ? (
        <svg className="ww-reveal__leaves" viewBox="0 0 1200 640" aria-hidden="true">
          <PetalFall t={leaves} colours={palette} width={1200} height={640} shape="leaf" />
        </svg>
      ) : null}
      <FairCrowd members={crowd} clapping={clapping} />
      {step.kind === "finale" && visitor !== undefined ? (
        <p className="ww-reveal__bubble" role="status">
          <strong>{visitor.name}:</strong> “What a lovely {setTemplateById(set.templateId).name}! It would
          feel right at home on Larkspur Road.”
        </p>
      ) : null}
      {step.kind === "title" ? (
        <div className="ww-reveal__title" style={{ opacity: Math.min(1, t * 3) }}>
          <span className="ad-eyebrow">The Larkspur Craft Fair</span>
          <h2>{theme.name}</h2>
          <p>
            {fairBoothByNumber(result.booth).name} · “{makersNoteById(result.plan.note).text}”
          </p>
        </div>
      ) : null}
      {step.kind === "wait" ? (
        <button type="button" className="ww-reveal__lift" onClick={onNext} autoFocus data-testid="lift-sheet">
          Lift the dust sheet
        </button>
      ) : null}
      {step.kind === "panels" ? (
        <PanelFlips
          panels={result.panels}
          iconOf={(id) => PANEL_LOOKS[id].icon}
          instant={reduced}
          block="ww-flip"
        />
      ) : null}
      {step.kind === "title" || step.kind === "panels" ? null : (
        <p
          className={step.kind === "finale" ? "ww-reveal__caption ad-visually-hidden" : "ww-reveal__caption"}
          aria-live="polite"
        >
          {caption(step, currentName, theme)}
        </p>
      )}
    </div>
  );
}

export function BoothReveal({ theme, result, set, showroom, upgrades, replay, onDone }: BoothRevealProps) {
  const { reducedMotion } = useSettings();
  const looks = useMemo(() => floorLooks(set), [set]);
  const steps = useMemo(
    () => revealSteps(result.plan.order.length, reducedMotion, REVEAL_TIMINGS),
    [result.plan.order.length, reducedMotion],
  );
  const { index, step, next, canSkip } = useRevealSteps(steps, replay, onDone);
  const music = fairMusicById(result.plan.music);
  return (
    <section
      className={reducedMotion ? "ww-reveal ww-reveal--still" : "ww-reveal"}
      aria-label={`${theme.name} booth reveal`}
      data-testid="booth-reveal"
      data-scene={
        step === undefined ? "done" : `${sceneName(step)}${step.slot >= 0 ? `-${step.slot + 1}` : ""}`
      }
    >
      <StepView
        key={index}
        steps={steps}
        index={index}
        reduced={reducedMotion}
        onNext={next}
        theme={theme}
        result={result}
        set={set}
        looks={looks}
        sky={currentSeason(showroom).sky}
        awning={upgrades.includes("booth-awning")}
      />
      <div className="ww-reveal__hud">
        <span className={reducedMotion ? "ww-reveal__music" : "ww-reveal__music ww-reveal__music--playing"}>
          ♪ {music.name}
        </span>
        <div className="ww-reveal__progress">
          <span className="ww-reveal__scene-label">
            Scene {Math.min(index + 1, steps.length)} of {steps.length}
            {step === undefined ? "" : ` · ${SCENE_LABELS[step.kind]}`}
          </span>
          <ol className="ww-reveal__pips" aria-label="Reveal progress">
            {steps.map((_, at) => (
              <li key={at} className={at === index ? "is-active" : at < index ? "is-done" : ""} />
            ))}
          </ol>
        </div>
        {canSkip ? (
          <Button variant="secondary" size="sm" onClick={onDone} data-testid="skip-reveal">
            Skip to the rosettes ›
          </Button>
        ) : null}
      </div>
    </section>
  );
}
