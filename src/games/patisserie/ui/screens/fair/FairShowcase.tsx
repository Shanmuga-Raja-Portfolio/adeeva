import type { AvatarLook } from "../../../../../engine/avatar";
import { memo, useMemo, type CSSProperties } from "react";
import { colourById } from "../../../../../engine/palette";
import { useSettings } from "../../../../../studio/SettingsContext";
import { PetalFall } from "../../../../../ui/art/PetalFall";
import { Button } from "../../../../../ui/kit/Button";
import { easeInOut, easeOut, window01 } from "../../../../../ui/kit/easing";
import { useShowClock } from "../../../../../ui/kit/useShowClock";
import type { FairThemeDef } from "../../../content/fairTheme";
import { FAIR_PANELS } from "../../../content/panelMember";
import { clientById, fairMusicById, fairTentByNumber, tableClothById, type FairResult } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { Cloche } from "../../art/Cloche";
import { GlasshouseBackdrop } from "../../art/GlasshouseBackdrop";
import { PanelFlips } from "../../../../../ui/show/PanelFlips";
import { PANEL_LOOKS } from "./panelLooks";
import { showcaseSteps } from "./showcaseSteps";
import { revealedSlots, type RevealStep } from "../../../../../ui/show/revealSteps";
import { useRevealSteps } from "../../../../../ui/show/useRevealSteps";
import { ShowcaseCrowd, type ShowcaseFan } from "./ShowcaseCrowd";
import "./showcase.css";
import type { ShowPlateView } from "./showPlates";

export interface FairShowcaseProps {
  readonly theme: FairThemeDef;
  readonly result: FairResult;
  readonly plates: readonly ShowPlateView[];
  readonly visitors: readonly string[];
  readonly skippable: boolean;
  readonly onDone: () => void;
}

const REST_SPOTS = [20, 80, 50];
const SPARKLES = Array.from({ length: 16 }, (_, index) => index);
const STAR_PATH = "M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z";
const BURST_PATH =
  "M0 -8 L1.6 -2.4 L5.7 -5.7 L2.4 -1.6 L8 0 L2.4 1.6 L5.7 5.7 L1.6 2.4 L0 8 L-1.6 2.4 L-5.7 5.7 L-2.4 1.6 L-8 0 L-2.4 -1.6 L-5.7 -5.7 L-1.6 -2.4 Z";
const Backdrop = memo(GlasshouseBackdrop);
const Bake = memo(BakePreview);

function restSpot(position: number, count: number): number {
  if (position === count - 1) return 50;
  return REST_SPOTS[position] ?? 50;
}

function lookalike(one: AvatarLook, other: AvatarLook): boolean {
  return one.hairStyle === other.hairStyle && one.hairColour === other.hairColour;
}

function caption(step: RevealStep, plates: readonly ShowPlateView[], theme: FairThemeDef): string {
  const plate = plates[step.slot];
  switch (step.kind) {
    case "title":
      return `Welcome to the Larkspur Patisserie Fair: ${theme.name}!`;
    case "lights":
      return "The string lights brighten over the long table…";
    case "glide":
      return `Here comes ${plate === undefined ? "a plate" : plate.label.replace(/^Your /, "your ")}…`;
    case "wait":
      return "Tap the cloche to lift it!";
    case "reveal":
      return `${plate?.label ?? "A plate"}! The glasshouse gasps.`;
    case "finale":
      return "Petals fall and the whole glasshouse claps!";
    case "panels":
      return "The three panels share their notes…";
  }
}

function showcaseFans(visitors: readonly string[]): ShowcaseFan[] {
  return [
    ...FAIR_PANELS.flatMap((panel) =>
      panel.members.map((member) => ({ name: member.name, look: member.look })),
    ),
    ...visitors.flatMap((id) => {
      const client = clientById(id);
      return client === undefined ? [] : [{ name: client.guestName, look: client.look }];
    }),
  ].filter((member, at, all) => all.findIndex((other) => lookalike(other.look, member.look)) === at);
}

interface StepViewProps extends Omit<FairShowcaseProps, "skippable" | "visitors"> {
  readonly fans: readonly ShowcaseFan[];
  readonly steps: readonly RevealStep[];
  readonly index: number;
  readonly reduced: boolean;
  readonly onNext: () => void;
}

function StepView({ steps, index, reduced, onNext, theme, result, plates, fans }: StepViewProps) {
  const step = steps[index] ?? steps[steps.length - 1];
  const elapsed = useShowClock(step?.ms ?? 1, onNext);
  if (step === undefined) return null;
  const t = step.ms === 0 ? 1 : elapsed / step.ms;
  const order = result.plan.order;
  const position = step.slot;
  const revealed = revealedSlots(steps, index);
  const lights = step.kind === "title" ? 0.15 : step.kind === "lights" ? 0.15 + 0.85 * easeOut(t) : 1;
  const cloth = tableClothById(result.plan.cloth).colour;
  const onTurntable = step.kind === "glide" || step.kind === "wait" || step.kind === "reveal";
  const currentSlot = onTurntable ? order[position] : undefined;
  const current = currentSlot === undefined ? undefined : plates[currentSlot];
  const glideX = step.kind === "glide" ? -18 + 68 * easeInOut(t) : 50;
  const lift = step.kind === "reveal" ? easeOut(window01(t, 0, 0.6)) : 0;
  const sparkle = step.kind === "reveal" ? window01(t, 0.15, 1) : 0;
  const clapping = step.kind === "finale" || step.kind === "panels";
  const cheering = clapping || step.kind === "reveal";
  const petals = clapping ? (step.kind === "finale" ? t : 1 + t) * 0.9 : -1;
  const palette = [...theme.palette.map((colour) => colourById(colour).hex), "#fff6ee"];
  return (
    <>
      <div className="pa-showcase__stage" data-step={step.kind} data-plate={step.slot}>
        <Backdrop className="pa-showcase__backdrop" lights={lights} cloth={cloth} />
        {revealed.map((slotPosition) => {
          const slot = order[slotPosition];
          const plate = slot === undefined ? undefined : plates[slot];
          if (plate === undefined || plate.look === null) return null;
          return (
            <div
              key={slotPosition}
              className="pa-showcase__plate pa-showcase__plate--rest"
              style={{ left: `${restSpot(slotPosition, order.length)}%` } as CSSProperties}
            >
              <Bake look={plate.look} title={plate.label} plaque={plate.plaque} />
              <span className="pa-showcase__card">{plate.label}</span>
            </div>
          );
        })}
        {current !== undefined && current.look !== null ? (
          <div
            className="pa-showcase__plate pa-showcase__plate--turntable"
            style={{ left: `${reduced ? 50 : glideX}%` }}
          >
            {sparkle > 0 ? (
              <span
                className="pa-showcase__halo"
                style={{ opacity: Math.min(1, sparkle * 1.6) } as CSSProperties}
                aria-hidden="true"
              />
            ) : null}
            <Bake
              look={current.look}
              title={step.kind === "reveal" ? current.label : null}
              plaque={current.plaque}
            />
            <span className="pa-showcase__trolley" aria-hidden="true" />
            {step.kind === "reveal" ? <span className="pa-showcase__spot" aria-hidden="true" /> : null}
            {step.kind === "wait" ? (
              <button
                type="button"
                className="pa-showcase__cloche pa-showcase__cloche--tap"
                onClick={onNext}
                tabIndex={-1}
                aria-label="Lift the cloche"
                data-testid="cloche-art"
              >
                <Cloche />
              </button>
            ) : step.kind !== "reveal" || lift < 1 ? (
              <div
                className="pa-showcase__cloche"
                style={{ transform: `translateY(${-lift * 120}%)`, opacity: 1 - lift } as CSSProperties}
              >
                <Cloche />
              </div>
            ) : null}
            {sparkle > 0 ? (
              <svg className="pa-showcase__sparkles" viewBox="-100 -100 200 200" aria-hidden="true">
                {SPARKLES.map((index) => {
                  const angle = -Math.PI / 2 + ((index * 137.5) % 360) * (Math.PI / 180);
                  const radius = [62, 76, 68, 84][index % 4] ?? 70;
                  const reach = radius + (14 + (index % 5) * 9) * sparkle;
                  const size = [1.25, 0.4, 0.8, 0.3, 0.55][index % 5] ?? 1;
                  const x = (Math.cos(angle) * reach).toFixed(1);
                  const y = (Math.sin(angle) * reach * 0.72 - 18).toFixed(1);
                  if (index % 4 === 3)
                    return (
                      <circle key={index} cx={x} cy={y} r={2.2} fill="#ffffff" opacity={1 - sparkle * 0.3} />
                    );
                  return (
                    <path
                      key={index}
                      d={index % 3 === 1 ? BURST_PATH : STAR_PATH}
                      fill={index % 2 === 0 ? "#ffd65c" : "#fff7d6"}
                      stroke="#ffffff"
                      strokeWidth={0.8}
                      opacity={1 - sparkle * 0.3}
                      transform={`translate(${x} ${y}) rotate(${(index * 23) % 45}) scale(${size + sparkle * 0.5})`}
                    />
                  );
                })}
              </svg>
            ) : null}
          </div>
        ) : null}
        {petals >= 0 && !reduced ? (
          <svg className="pa-showcase__petals" viewBox="0 0 1200 640" aria-hidden="true">
            <PetalFall t={petals} colours={palette} width={1200} height={640} />
          </svg>
        ) : null}
        <ShowcaseCrowd members={fans} cheering={cheering} clapping={clapping} />
        {step.kind === "title" ? (
          <div className="pa-showcase__title" style={{ opacity: Math.min(1, t * 3) }}>
            <span className="ad-eyebrow">The Larkspur Patisserie Fair</span>
            <h2>{theme.name}</h2>
            <p>{fairTentByNumber(result.tent).name}</p>
          </div>
        ) : null}
        {step.kind === "wait" ? (
          <button
            type="button"
            className="pa-showcase__lift"
            onClick={onNext}
            autoFocus
            data-testid="lift-cloche"
          >
            Lift the cloche
          </button>
        ) : null}
        {step.kind === "panels" ? (
          <PanelFlips
            panels={result.panels}
            iconOf={(id) => PANEL_LOOKS[id].icon}
            instant={reduced}
            block="pa-flip"
          />
        ) : null}
        {step.kind === "title" || step.kind === "panels" ? null : (
          <p className="pa-showcase__caption" aria-live="polite">
            {caption(step, plates, theme)}
          </p>
        )}
      </div>
    </>
  );
}

export function FairShowcase({ theme, result, plates, visitors, skippable, onDone }: FairShowcaseProps) {
  const { reducedMotion } = useSettings();
  const steps = useMemo(() => showcaseSteps(plates.length, reducedMotion), [plates.length, reducedMotion]);
  const { index, step, next, canSkip } = useRevealSteps(steps, skippable, onDone);
  const fans = useMemo(() => showcaseFans(visitors), [visitors]);
  const music = fairMusicById(result.plan.music);
  return (
    <section
      className={reducedMotion ? "pa-showcase pa-showcase--still" : "pa-showcase"}
      aria-label={`${theme.name} showcase`}
      data-testid="fair-showcase"
      data-scene={step === undefined ? "done" : `${step.kind}${step.slot >= 0 ? `-${step.slot + 1}` : ""}`}
    >
      <StepView
        key={index}
        steps={steps}
        index={index}
        reduced={reducedMotion}
        onNext={next}
        theme={theme}
        result={result}
        plates={plates}
        fans={fans}
        onDone={onDone}
      />
      <div className="pa-showcase__hud">
        <span
          className={reducedMotion ? "pa-showcase__music" : "pa-showcase__music pa-showcase__music--playing"}
        >
          <span aria-hidden="true">♪</span> Music: {music.name}
        </span>
        <span className="pa-showcase__step" aria-hidden="true">
          Show {Math.min(index + 1, steps.length)} of {steps.length}
        </span>
        <span
          className="pa-showcase__progress"
          role="progressbar"
          aria-label="Showcase progress"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={Math.min(index + 1, steps.length)}
        >
          <span
            className="pa-showcase__progress-fill"
            style={{ width: `${(Math.min(index + 1, steps.length) / steps.length) * 100}%` }}
          />
        </span>
        {canSkip ? (
          <Button variant="secondary" size="sm" onClick={onDone} data-testid="skip-showcase">
            Skip to the ribbons ›
          </Button>
        ) : step?.kind === "reveal" ? (
          <Button size="lg" onClick={next} data-testid="showcase-on" className="pa-showcase__on">
            Keep going ›
          </Button>
        ) : null}
      </div>
    </section>
  );
}
