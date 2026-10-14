import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { HINTS } from "../../../content/hints";
import { jewelColourById } from "../../../content/jewelColour";
import { METALS, type MetalId } from "../../../content/metal";
import type { OptionId, OptionSlot } from "../../../content/partOption";
import { STONES, type StoneId } from "../../../content/stone";
import {
  metalLocked,
  pieceTags,
  productById,
  runSource,
  slotOptions,
  stockPrice,
  stoneLocked,
} from "../../../core";
import { metalLook } from "../../art/metalLook";
import { PiecePreview } from "../../art/PiecePreview";
import { ShapeThumb } from "../../art/ShapeThumb";
import { StoneArt } from "../../art/StoneArt";
import { ChoiceGrid } from "./ChoiceGrid";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./design.css";

const SLOT_TITLES: Readonly<Record<OptionSlot, string>> = {
  shape: "Shape",
  band: "Band",
  accent: "Accent",
};

function Glints({ count }: { readonly count: number }) {
  return (
    <span className="jb-glints" aria-hidden="true">
      {"✦".repeat(count)}
    </span>
  );
}

function Hammers({ count }: { readonly count: number }) {
  return (
    <span className="jb-hammers" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} viewBox="0 0 12 12" width={12} height={12}>
          <path
            d="M2 4 L7 1.5 L9 3.5 L4 6 Z M6 5 L10.5 10.5"
            stroke="currentColor"
            strokeWidth={1.4}
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}

export function DesignStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const product = productById(run.design.productId);
  const source = runSource(run);
  const tags = pieceTags(source);
  const avoided = run.brief?.avoidMetals ?? [];
  const metalId = run.design.metalId;
  return (
    <div className="jb-design">
      <div className="jb-design__layout">
        <figure className="jb-design__preview">
          <PiecePreview source={source} title={`Your ${product.name}`} twinkle className="jb-design__piece" />
          <figcaption>
            <strong>{product.name}</strong>
            <span className="jb-design__tags">
              {tags.map((tag) => (
                <TagPill key={tag} tone={state.trends.current.includes(tag) ? "hot" : "plain"}>
                  {tag}
                </TagPill>
              ))}
            </span>
          </figcaption>
        </figure>
        <div className="jb-design__controls">
          {product.slots.map((slot) => (
            <section key={slot} className="jb-design__group">
              <h3>{SLOT_TITLES[slot]}</h3>
              <ChoiceGrid<OptionId>
                label={SLOT_TITLES[slot]}
                value={run.design.options[slot] ?? null}
                onChange={(optionId) => dispatch({ type: "chooseOption", slot, optionId })}
                choices={slotOptions(slot).map((option) => ({
                  value: option.id,
                  label: option.name,
                  note: option.cutting,
                  content: (
                    <>
                      <ShapeThumb optionId={option.id} />
                      <span className="jb-choice__name">{option.name}</span>
                      <span className="jb-choice__sub">{option.tags.join(", ")}</span>
                    </>
                  ),
                }))}
              />
            </section>
          ))}
          <section className="jb-design__group">
            <h3>Metal</h3>
            <ChoiceGrid<MetalId>
              label="Metal"
              className="jb-choices--metals"
              value={metalId}
              onChange={(id) => dispatch({ type: "chooseMetal", metalId: id })}
              choices={METALS.map((metal) => {
                const locked = metalLocked(state, metal.id);
                const look = metalLook(metal.id, "high-shine");
                return {
                  value: metal.id,
                  label: `${metal.name}, ${stockPrice(metal.id, "sheet")} coins a sheet${locked ? `, unlocks at reputation ${metal.minReputation}` : ""}`,
                  disabled: locked,
                  content: (
                    <>
                      <span
                        className="jb-metal-swatch"
                        style={{
                          background: `linear-gradient(135deg, ${look.light}, ${look.mid} 55%, ${look.dark})`,
                        }}
                      />
                      <span className="jb-choice__name">{metal.name}</span>
                      {locked ? (
                        <span className="jb-choice__sub">
                          <Icon name="lock" size={12} /> Rep {metal.minReputation}
                        </span>
                      ) : (
                        <span className="jb-choice__sub">
                          <Icon name="coin" size={12} /> {stockPrice(metal.id, "sheet")} ·{" "}
                          <Hammers count={metal.hammers} /> <Glints count={metal.sparkle} />
                        </span>
                      )}
                    </>
                  ),
                };
              })}
            />
            {metalId !== null && avoided.includes(metalId) ? (
              <p className="jb-design__warn">{HINTS.avoidMetal}</p>
            ) : null}
            <p className="jb-hint">
              Hammers mean tough metal: harder to cut. Glints mean extra sparkle and a bonus.
            </p>
          </section>
          {product.seats.length > 0 ? (
            <section className="jb-design__group">
              <h3>Stone</h3>
              <ChoiceGrid<StoneId>
                label="Stone"
                className="jb-choices--stones"
                value={run.design.stoneId}
                onChange={(id) => dispatch({ type: "chooseStone", stoneId: id })}
                choices={STONES.map((stone) => {
                  const locked = stoneLocked(state, stone.id);
                  return {
                    value: stone.id,
                    label: `${stone.name}, ${stone.price} coins${locked ? `, unlocks at reputation ${stone.minReputation}` : ""}`,
                    disabled: locked,
                    content: (
                      <>
                        <svg className="jb-stone-thumb" viewBox="-20 -20 40 40" aria-hidden="true">
                          <StoneArt
                            cut={stone.cut}
                            hex={jewelColourById(stone.colour).hex}
                            x={0}
                            y={0}
                            size={30}
                          />
                        </svg>
                        <span className="jb-choice__name">{stone.name}</span>
                        <span className="jb-choice__sub">
                          {locked ? (
                            <>
                              <Icon name="lock" size={12} /> Rep {stone.minReputation}
                            </>
                          ) : (
                            <>
                              <Icon name="coin" size={12} /> {stone.price}
                            </>
                          )}
                        </span>
                      </>
                    ),
                  };
                })}
              />
            </section>
          ) : null}
        </div>
      </div>
      <StageFooter {...props} ready="A lovely design. Time to gather supplies!" />
    </div>
  );
}
