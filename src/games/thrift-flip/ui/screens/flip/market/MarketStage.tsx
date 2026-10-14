import { useState } from "react";
import { useToast } from "../../../../../../studio/ToastContext";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../../ui/kit/useDispatchOnce";
import type { ConditionGrade } from "../../../../content/condition";
import type { FindId } from "../../../../content/find";
import {
  buyIssues,
  conditionById,
  findBlockIssue,
  findById,
  findFitsKey,
  fitKey,
  hotMarker,
  MARKET_VISIT_HOURS,
  marketVisitIssue,
  MAX_FINDS_PER_FLIP,
} from "../../../../core";
import { FindArt } from "../../../art/FindArt";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { FindCloseUp } from "./FindCloseUp";
import { FitsBadge } from "./FitsBadge";
import { RailFind } from "./RailFind";
import "./market.css";

interface CloseUp {
  readonly findId: FindId;
  readonly grade: ConditionGrade;
}

export function MarketStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [picked, setPicked] = useState<readonly string[]>([]);
  const [closeUp, setCloseUp] = useState<CloseUp | null>(null);
  const key = fitKey(run.design);
  const fits = (findId: FindId) => key !== null && findFitsKey(findId, key);
  const twoFinds = run.design.recipeId === "patch-throw";
  const open = state.calendar.marketOpen;
  const visitIssue = marketVisitIssue(state);
  const livePicked = picked.filter((id) => state.rail.some((slot) => slot.id === id && !slot.sold));
  const total = state.rail
    .filter((slot) => livePicked.includes(slot.id))
    .reduce((sum, slot) => sum + slot.price, 0);
  const buyIssue = buyIssues(state, livePicked)[0];
  const chosenIds = run.finds.map((owned) => owned.id);

  const toggle = (slotId: string) =>
    setPicked((current) =>
      current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId],
    );

  const buy = (event: ClickLike) => {
    if (once(event, { type: "buyFinds", slotIds: livePicked })) {
      toast(
        livePicked.length === 1
          ? "Find bought! It's in your stockroom."
          : "Finds bought! They're in your stockroom.",
      );
      setPicked([]);
    }
  };

  const toggleUse = (findKey: string) => {
    const next = chosenIds.includes(findKey)
      ? chosenIds.filter((id) => id !== findKey)
      : [...chosenIds, findKey];
    dispatch({ type: "chooseFinds", findIds: next.slice(-MAX_FINDS_PER_FLIP) });
  };

  return (
    <div className="tf-market">
      <section className="tf-market__rail" aria-labelledby="tf-rail-title">
        <header className="tf-market__head">
          <h2 id="tf-rail-title">Today's rail</h2>
          {open ? (
            <span className="tf-market__open">
              <Icon name="sparkle" size={16} /> Open for browsing
            </span>
          ) : (
            <Button
              icon="bag"
              onClick={() => dispatch({ type: "openMarket" })}
              disabledReason={visitIssue ?? undefined}
              data-testid="open-market"
            >
              Visit the rail · {MARKET_VISIT_HOURS} h
            </Button>
          )}
        </header>
        <div className={open ? "tf-market__pole tf-market__pole--open" : "tf-market__pole"}>
          <ul className="tf-market__finds">
            {state.rail.map((slot, index) => (
              <RailFind
                key={slot.id}
                slot={slot}
                index={index}
                fits={fits(slot.findId)}
                twoFinds={twoFinds}
                hot={hotMarker(state, slot.findId)}
                picked={livePicked.includes(slot.id)}
                open={open}
                onToggle={() => toggle(slot.id)}
                onCloseUp={() => setCloseUp({ findId: slot.findId, grade: slot.grade })}
              />
            ))}
          </ul>
          {open ? null : (
            <p className="tf-market__curtain">Visit the rail to pick finds. Owned finds work too.</p>
          )}
        </div>
        {open ? (
          <div className="tf-market__buy">
            <span>
              {livePicked.length === 0
                ? "Pick finds to buy them together."
                : `${livePicked.length} picked · `}
              {livePicked.length > 0 ? (
                <strong>
                  <Icon name="coin" size={14} /> {total}
                </strong>
              ) : null}
            </span>
            <Button icon="bag" onClick={buy} disabledReason={buyIssue} data-testid="buy-finds">
              Buy {livePicked.length === 0 ? "" : livePicked.length}{" "}
              {livePicked.length === 1 ? "find" : "finds"}
            </Button>
          </div>
        ) : null}
      </section>
      <section className="tf-market__stock" aria-labelledby="tf-stock-title">
        <h2 id="tf-stock-title">Use for this flip</h2>
        <p className="ad-muted">Pick up to {MAX_FINDS_PER_FLIP} finds. Two small finds can share one flip.</p>
        {state.stock.finds.length === 0 ? (
          <p className="tf-market__none">Your stockroom is empty. Buy a find from the rail.</p>
        ) : (
          <ul className="tf-market__owned">
            {state.stock.finds.map((owned) => {
              const find = findById(owned.findId);
              const used = chosenIds.includes(owned.id);
              const blocked = findBlockIssue(run.design, owned);
              return (
                <li
                  key={owned.id}
                  className={used ? "tf-owned tf-owned--used" : "tf-owned"}
                  data-owned={owned.findId}
                >
                  <FindArt find={find} grade={owned.grade} size={64} />
                  <span className="tf-owned__body">
                    <strong>{find.name}</strong>
                    <small>{conditionById(owned.grade).name}</small>
                    <FitsBadge fits={fits(owned.findId)} twoFinds={twoFinds} />
                  </span>
                  <Button
                    size="sm"
                    variant={used ? "primary" : "secondary"}
                    onClick={() => toggleUse(owned.id)}
                    disabledReason={blocked ?? undefined}
                    aria-pressed={used}
                  >
                    {used ? "Using" : "Use"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <FindCloseUp
        findId={closeUp?.findId ?? null}
        grade={closeUp?.grade ?? "loved"}
        fits={closeUp !== null && fits(closeUp.findId)}
        twoFinds={twoFinds}
        onClose={() => setCloseUp(null)}
      />
      <StageFooter {...props} hint="Great finds! Off to the workbench to take them apart." />
    </div>
  );
}
