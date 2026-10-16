import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { FLOORS } from "../../../content/floor";
import { HOME_HINTS } from "../../../content/hints";
import { PAINTS } from "../../../content/paint";
import {
  floorById,
  homeStoryById,
  paintById,
  PALETTE_PAINTS,
  paletteIssues,
  PLAN_HOME_HOURS,
  plotById,
} from "../../../core";
import { roomHex } from "../../art/roomHex";
import { StoryCard } from "../larkspur/StoryCard";
import type { HomeStageProps } from "./HomeScreen";

function PalettePreview({
  paints,
  floor,
}: {
  readonly paints: readonly string[];
  readonly floor: string | null;
}) {
  const [first, second, third] = paints;
  return (
    <svg
      viewBox="0 0 240 150"
      className="is-palette__house"
      role="img"
      aria-label="Your home palette on a little house"
    >
      <path
        d="M20 70 L120 12 L220 70 Z"
        fill="#c8664a"
        stroke="#3b2a33"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <rect x={34} y={68} width={172} height={74} fill="#fffaf2" stroke="#3b2a33" strokeWidth={3} />
      <rect x={42} y={76} width={50} height={58} fill={first ?? "#e9e2d8"} stroke="#3b2a33" strokeWidth={2} />
      <rect
        x={95}
        y={76}
        width={50}
        height={58}
        fill={second ?? "#e9e2d8"}
        stroke="#3b2a33"
        strokeWidth={2}
      />
      <rect
        x={148}
        y={76}
        width={50}
        height={58}
        fill={third ?? "#e9e2d8"}
        stroke="#3b2a33"
        strokeWidth={2}
      />
      {floor === null ? null : (
        <rect x={42} y={124} width={156} height={10} fill={floor} stroke="#3b2a33" strokeWidth={1.5} />
      )}
      <circle cx={196} cy={26} r={10} fill="#f6d77a" />
    </svg>
  );
}

export function PaletteBoard({ state, project, dispatch }: HomeStageProps) {
  const once = useDispatchOnce(state, dispatch);
  const plot = plotById(project.plotId);
  const story = homeStoryById(project.storyId);
  const chosen = project.palette.paints;
  const issues = paletteIssues(project);
  const storyColour = (colour: string) => story.palette.some((entry) => entry === colour);
  const hall = project.palette.hallFloor;
  return (
    <div className="is-palette">
      <p className="is-home__hint" role="status" aria-live="polite">
        <Icon name="palette" size={16} /> {HOME_HINTS.palette}
      </p>
      <div className="is-palette__layout">
        <aside className="is-palette__story">
          <StoryCard story={story} />
          <PalettePreview
            paints={chosen.map((id) => roomHex(paintById(id).colour))}
            floor={hall === null ? null : roomHex(floorById(hall).colours[0] ?? "ivory")}
          />
        </aside>
        <section className="is-palette__pick" aria-labelledby="is-palette-paints">
          <h2 id="is-palette-paints" className="is-tray__heading">
            Three paints for the whole home{" "}
            <span className="is-muted" data-testid="palette-count">
              {chosen.length} of {PALETTE_PAINTS}
            </span>
          </h2>
          <div className="is-palette__paints">
            {PAINTS.map((paint) => {
              const on = chosen.includes(paint.id);
              return (
                <button
                  key={paint.id}
                  type="button"
                  aria-pressed={on}
                  className={on ? "is-chip is-chip--on" : "is-chip"}
                  onClick={(event) => once(event, { type: "togglePalettePaint", paintId: paint.id })}
                  disabled={!on && chosen.length >= PALETTE_PAINTS}
                  data-testid={`palette-${paint.id}`}
                >
                  <span className="is-chip__swatch" style={{ background: roomHex(paint.colour) }} />
                  <span className="is-chip__name">{paint.name}</span>
                  <span className="is-chip__meta">{paint.tags.join(", ")}</span>
                  {storyColour(paint.colour) ? <span className="is-chip__ribbon">Story colour</span> : null}
                </button>
              );
            })}
          </div>
          {plot.hall ? (
            <>
              <h2 className="is-tray__heading">
                The hall floor <span className="is-muted">rooms next to it can share the pattern</span>
              </h2>
              <div className="is-palette__floors" role="radiogroup" aria-label="Hall floor">
                {FLOORS.map((floor) => (
                  <button
                    key={floor.id}
                    type="button"
                    role="radio"
                    aria-checked={hall === floor.id}
                    className="is-chip"
                    onClick={(event) => once(event, { type: "setHallFloor", floorId: floor.id })}
                    data-testid={`hall-floor-${floor.id}`}
                  >
                    <span
                      className={`is-chip__floor is-chip__floor--${floor.pattern}`}
                      style={{ background: roomHex(floor.colours[0] ?? "ivory") }}
                    />
                    <span className="is-chip__name">{floor.name}</span>
                    {floor.colours.some(storyColour) ? (
                      <span className="is-chip__ribbon">Story colour</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="is-muted">{plot.name} has no hall, so there is no hall floor to choose.</p>
          )}
          <div className="is-map__actions">
            <Button
              variant="secondary"
              icon="sparkle"
              onClick={(event) => once(event, { type: "useAchebePalette" })}
              data-testid="achebe-palette"
            >
              Ms. Achebe suggests…
            </Button>
            <Button
              size="lg"
              disabledReason={issues[0]}
              showReason
              onClick={(event) => once(event, { type: "confirmPalette" })}
              data-testid="confirm-palette"
            >
              That's our palette <span className="is-footer__hours">{PLAN_HOME_HOURS} h</span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
