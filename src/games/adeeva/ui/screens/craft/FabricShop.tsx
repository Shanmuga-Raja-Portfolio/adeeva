import { useState } from "react";
import { FABRICS, type FabricDef } from "../../../content/fabric";
import {
  fabricById,
  fabricsNeedingCut,
  hoursShortfallReason,
  isFabricUnlocked,
  materialById,
  METRE_STEP,
  SHOP_VISIT_HOURS,
  shopVisitIssue,
  type Action,
  type DressRun,
  type GameState,
} from "../../../core";
import { FabricSwatch } from "../../art/FabricSwatch";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { estimatedMetres } from "./fabricEstimate";
import { HoursNotice } from "./HoursNotice";
import { ShopFabricCard } from "./ShopFabricCard";
import { NO_SHOP_FILTER, ShopFilters, type ShopFilterState } from "./ShopFilters";
import { TrimShelf } from "./TrimShelf";
import "./shop.css";

function hasFeel(fabric: FabricDef, tag: string): boolean {
  const materialTags = materialById(fabric.material).tags;
  return [...fabric.tags, ...materialTags].some((entry) => entry === tag);
}

function matches(
  state: GameState,
  fabric: FabricDef,
  filters: ShopFilterState,
  design: readonly string[],
): boolean {
  if (filters.material !== "" && fabric.material !== filters.material) return false;
  if (filters.colour !== "" && fabric.colour !== filters.colour) return false;
  if (filters.tag !== "" && !hasFeel(fabric, filters.tag)) return false;
  switch (filters.availability) {
    case "all":
      return true;
    case "design":
      return design.includes(fabric.id);
    case "owned":
      return (state.inventory.fabricMetres[fabric.id] ?? 0) > 0;
    case "locked":
      return !isFabricUnlocked(state, fabric);
  }
}

function suggestedMetres(needed: number, owned: number): number {
  return Math.max(METRE_STEP, Math.ceil((needed - owned) / METRE_STEP) * METRE_STEP);
}

export interface FabricShopProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

export function FabricShop({ state, run, dispatch, onExit }: FabricShopProps) {
  const once = useDispatchOnce(state, dispatch);
  const [filters, setFilters] = useState<ShopFilterState>(NO_SHOP_FILTER);
  const [metres, setMetres] = useState<Readonly<Record<string, number>>>({});
  const open = state.calendar.shopOpen;
  const design = fabricsNeedingCut(run.design);
  const needs = design.map((fabricId) => ({
    fabricId,
    fabric: fabricById(fabricId),
    needed: estimatedMetres(run, fabricId),
    owned: state.inventory.fabricMetres[fabricId] ?? 0,
  }));
  const visitIssue = shopVisitIssue(state);
  const hoursIssue = hoursShortfallReason(state.calendar, SHOP_VISIT_HOURS);
  const shown = FABRICS.filter((fabric) => matches(state, fabric, filters, design)).sort(
    (a, b) => Number(design.includes(b.id)) - Number(design.includes(a.id)),
  );
  return (
    <div className="ad-shop">
      <div className={open ? "ad-shop-door ad-shop-door--open" : "ad-shop-door"}>
        <span className="ad-shop-door__icon" aria-hidden="true">
          <Icon name="bag" size={30} />
        </span>
        <div className="ad-shop-door__text">
          <strong>
            {open ? "Welcome in! The shop is open." : "Fabric & Notions, just around the corner"}
          </strong>
          <span>
            {open
              ? "Fabric is sold by the half metre. Coins leave your purse the moment you buy."
              : `A visit takes ${SHOP_VISIT_HOURS} hour, so buy everything you need in one trip.`}
          </span>
        </div>
        {open ? (
          <Button variant="secondary" onClick={(event) => once(event, { type: "closeShop" })}>
            Leave the shop
          </Button>
        ) : (
          <Button
            onClick={(event) => once(event, { type: "openShop" })}
            disabledReason={visitIssue ?? undefined}
            data-testid="open-shop"
          >
            Visit the shop · {SHOP_VISIT_HOURS} h
          </Button>
        )}
      </div>
      {!open && hoursIssue !== null ? <HoursNotice message={hoursIssue} onExit={onExit} /> : null}

      <Card
        title="What your design needs"
        eyebrow="Estimated from the pattern pieces"
        className="ad-shop-needs"
      >
        <ul className="ad-shop-needs__list">
          {needs.map((need) => {
            const enough = need.owned >= need.needed;
            return (
              <li key={need.fabricId} className={enough ? "ad-shop-need ad-shop-need--met" : "ad-shop-need"}>
                {need.fabric !== undefined ? (
                  <FabricSwatch fabric={need.fabric} size={44} decorative />
                ) : null}
                <span className="ad-shop-need__name">{need.fabric?.name ?? need.fabricId}</span>
                <span className="ad-shop-need__amount">
                  about {need.needed} m · you own {need.owned} m
                </span>
                <span className="ad-shop-need__status">
                  {enough ? (
                    <>
                      <Icon name="check" size={14} /> Enough
                    </>
                  ) : (
                    `Buy ${suggestedMetres(need.needed, need.owned)} m more`
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="ad-muted ad-shop-needs__note">
          The bolt is 140 cm wide. A snug layout at the cutting table can save fabric, so this is a friendly
          guess.
        </p>
      </Card>

      <section className="ad-shop-section" aria-label="Fabric catalogue">
        <header className="ad-shop-section__header">
          <h2>Fabric bolts</h2>
          <ShopFilters filters={filters} onChange={setFilters} />
        </header>
        {shown.length === 0 ? <p className="ad-muted">No fabrics match those filters.</p> : null}
        <ul className="ad-shop-grid">
          {shown.map((fabric) => {
            const need = needs.find((entry) => entry.fabricId === fabric.id);
            const fallback = need !== undefined ? suggestedMetres(need.needed, need.owned) : 1;
            return (
              <ShopFabricCard
                key={fabric.id}
                state={state}
                fabric={fabric}
                neededMetres={need?.needed ?? null}
                metres={metres[fabric.id] ?? fallback}
                onMetres={(value) => setMetres((current) => ({ ...current, [fabric.id]: value }))}
                dispatch={dispatch}
              />
            );
          })}
        </ul>
      </section>

      <section className="ad-shop-section" aria-label="Trims shelf">
        <header className="ad-shop-section__header">
          <h2>Trims & notions</h2>
          <span className="ad-muted">Pick up trims now: the shop is the only place that sells them.</span>
        </header>
        <TrimShelf state={state} run={run} dispatch={dispatch} />
      </section>
    </div>
  );
}
