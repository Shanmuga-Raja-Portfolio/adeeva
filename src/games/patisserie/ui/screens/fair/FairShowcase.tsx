import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { colourById } from "../../../../../engine/palette";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
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
import { PanelFlipCards } from "./PanelFlipCards";
import { showcaseSteps, type ShowcaseStep } from "./showcaseSteps";
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
const SPARKLES = Array.from({ length: 10 }, (_, index) => index);

function restSpot(position: number, count: number): number {
  if (position === count - 1) return 50;
  return REST_SPOTS[position] ?? 50;
}

function caption(step: ShowcaseStep, plates: readonly ShowPlateView[], theme: FairThemeDef): string {
  const plate = plates[step.plate];
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

interface StepViewProps extends Omit<FairShowcaseProps, "skippable"> {
  readonly steps: readonly ShowcaseStep[];
  readonly index: number;
  readonly reduced: boolean;
  readonly onNext: () => void;
}

function StepView({ steps, index, reduced, onNext, theme, result, plates, visitors }: StepViewProps) {
  const step = steps[index] ?? steps[steps.length - 1];
  const elapsed = useShowClock(step?.ms ?? 1, onNext);
  if (step === undefined) return null;
  const t = step.ms === 0 ? 1 : elapsed / step.ms;
  const order = result.plan.order;
  const position = step.plate;
  const revealed = steps
    .slice(0, index)
    .filter((entry) => entry.kind === "reveal")
    .map((entry) => entry.plate);
  const lights = step.kind === "title" ? 0.15 : step.kind === "lights" ? 0.15 + 0.85 * easeOut(t) : 1;
  const cloth = tableClothById(result.plan.cloth).colour;
  const onTurntable = step.kind === "glide" || step.kind === "wait" || step.kind === "reveal";
  const currentSlot = onTurntable ? order[position] : undefined;
  const current = currentSlot === undefined ? undefined : plates[currentSlot];
  const glideX = step.kind === "glide" ? -18 + 68 * easeInOut(t) : 50;
  const lift = step.kind === "reveal" ? easeOut(window01(t, 0, 0.6)) : 0;
  const sparkle = step.kind === "reveal" ? window01(t, 0.15, 1) : 0;
  const clapping = step.kind === "finale" || step.kind === "panels";
  const petals = clapping ? (step.kind === "finale" ? t : 1 + t) * 0.9 : -1;
  const palette = [...theme.palette.map((colour) => colourById(colour).hex), "#fff6ee"];
  const members = [
    ...FAIR_PANELS.flatMap((panel) =>
      panel.members.map((member) => ({ name: member.name, look: member.look })),
    ),
    ...visitors.flatMap((id) => {
      const client = clientById(id);
      return client === undefined ? [] : [{ name: client.guestName, look: client.look }];
    }),
  ];
  return (
    <>
      <div className="pa-showcase__stage" data-step={step.kind} data-plate={step.plate}>
        <GlasshouseBackdrop className="pa-showcase__backdrop" lights={lights} cloth={cloth} />
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
              <BakePreview look={plate.look} title={plate.label} plaque={plate.plaque} />
              <span className="pa-showcase__card">{plate.label}</span>
            </div>
          );
        })}
        {current !== undefined && current.look !== null ? (
          <div
            className="pa-showcase__plate pa-showcase__plate--turntable"
            style={{ left: `${reduced ? 50 : glideX}%` }}
          >
            <BakePreview
              look={current.look}
              title={step.kind === "reveal" ? current.label : null}
              plaque={current.plaque}
            />
            <span className="pa-showcase__trolley" aria-hidden="true" />
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
                  const angle = (index / SPARKLES.length) * Math.PI * 2;
                  const radius = 30 + 60 * sparkle;
                  return (
                    <path
                      key={index}
                      d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
                      fill={index % 2 === 0 ? "#ffe08a" : "#ffffff"}
                      opacity={1 - sparkle * 0.8}
                      transform={`translate(${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}) scale(${1 + sparkle})`}
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
        <div
          className={clapping ? "pa-showcase__crowd pa-showcase__crowd--clap" : "pa-showcase__crowd"}
          aria-hidden="true"
        >
          {members.map((member, at) => (
            <span key={member.name} style={{ animationDelay: `${(at % 4) * 120}ms` }}>
              <Avatar
                look={member.look}
                mood={clapping ? "delighted" : "happy"}
                size={64}
                title={member.name}
              />
            </span>
          ))}
        </div>
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
        {step.kind === "panels" ? <PanelFlipCards panels={result.panels} instant={reduced} /> : null}
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
  const [index, setIndex] = useState(0);
  const next = useCallback(() => {
    setIndex((current) => {
      if (current + 1 >= steps.length) {
        onDone();
        return current;
      }
      return current + 1;
    });
  }, [steps.length, onDone]);
  const step = steps[index];
  const canSkip = skippable || steps.slice(0, index).some((entry) => entry.kind === "reveal");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && canSkip) onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSkip, onDone]);
  const music = fairMusicById(result.plan.music);
  return (
    <section
      className={reducedMotion ? "pa-showcase pa-showcase--still" : "pa-showcase"}
      aria-label={`${theme.name} showcase`}
      data-testid="fair-showcase"
      data-scene={step === undefined ? "done" : `${step.kind}${step.plate >= 0 ? `-${step.plate + 1}` : ""}`}
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
        visitors={visitors}
        onDone={onDone}
      />
      <div className="pa-showcase__hud">
        <span
          className={reducedMotion ? "pa-showcase__music" : "pa-showcase__music pa-showcase__music--playing"}
        >
          ♪ {music.name}
        </span>
        <ol className="pa-showcase__pips" aria-label="Showcase progress">
          {steps.map((_, at) => (
            <li key={at} className={at === index ? "is-active" : at < index ? "is-done" : ""} />
          ))}
        </ol>
        {canSkip ? (
          <Button variant="secondary" size="sm" onClick={onDone} data-testid="skip-showcase">
            Skip to the ribbons ›
          </Button>
        ) : null}
      </div>
    </section>
  );
}
