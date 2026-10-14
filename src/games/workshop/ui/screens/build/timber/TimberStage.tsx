import { useState } from "react";
import { useToast } from "../../../../../../studio/ToastContext";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../../ui/kit/useDispatchOnce";
import { BOARD_SIZES, type BoardSizeId } from "../../../../content/boardSize";
import { hammersFor } from "../../../../content/wood";
import {
  boardPrice,
  buyIssues,
  countList,
  missingPlanBoards,
  ownedBoardsOf,
  planBoards,
  TIMBER_TRIP_HOURS,
  woodById,
  type BoardCounts,
} from "../../../../core";
import { BoardSurface } from "../../../art/BoardArt";
import { BoardThumb } from "../../../art/BoardThumb";
import { HammerIcons } from "../../../art/HammerIcons";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import "./timber.css";

const EMPTY_CART: BoardCounts = { short: 0, long: 0, panel: 0 };

export function TimberStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [cart, setCart] = useState<BoardCounts>(EMPTY_CART);
  const { productId, woodId } = run.design;
  if (productId === null || woodId === null) return <StageFooter {...props} />;
  const wood = woodById(woodId);
  const plan = planBoards(productId);
  const missing = missingPlanBoards(state, run);
  const owned = ownedBoardsOf(state, woodId);
  const sizes = countList(cart);
  const cartCheck = buyIssues(state, sizes);
  const planList = countList(missing);
  const planCheck = buyIssues(state, planList);
  const total = sizes.reduce((sum, size) => sum + boardPrice(state, woodId, size), 0);
  const change = (size: BoardSizeId, step: number) =>
    setCart((current) => ({ ...current, [size]: Math.max(0, Math.min(4, current[size] + step)) }));
  const buyCart = (event: { readonly detail: number }) => {
    if (once(event, { type: "buyBoards", sizes })) {
      setCart(EMPTY_CART);
      toast(`${sizes.length} ${sizes.length === 1 ? "board" : "boards"} of ${wood.name} on your rack!`);
    }
  };
  const buyPlan = (event: { readonly detail: number }) => {
    if (once(event, { type: "buyPlan" })) toast(`Your plan's boards of ${wood.name} are on your rack!`);
  };
  return (
    <div className="ww-timber">
      <div className="ww-timber__yard ww-paper">
        <header className="ww-timber__sign">
          <span className="ad-eyebrow">Pell's Timber Yard</span>
          <h2>
            {wood.name} <HammerIcons count={hammersFor(wood)} />
          </h2>
          <p className="ww-muted">
            {run.tripPaid
              ? "You're at the yard. Buy as much as you like this trip."
              : `A trip to the yard takes ${TIMBER_TRIP_HOURS} hour, however much you buy.`}
          </p>
        </header>
        <ul className="ww-timber__rack">
          {BOARD_SIZES.map((size) => {
            const fits = plan[size.id] > 0;
            const still = missing[size.id];
            return (
              <li
                key={size.id}
                className={fits ? "ww-timber__board ww-timber__board--fits" : "ww-timber__board"}
                data-testid={`yard-${size.id}`}
              >
                <svg
                  className={`ww-timber__art ww-timber__art--${size.id}`}
                  viewBox={`-1 -1 ${size.width + 2} ${size.height + 2}`}
                  aria-hidden="true"
                >
                  <BoardSurface
                    woodId={woodId}
                    width={size.width}
                    height={size.height}
                    knots={[]}
                    seed={size.width * 7}
                  />
                </svg>
                <div className="ww-timber__info">
                  <strong>{size.name}</strong>
                  <span className="ww-muted">
                    {size.width} × {size.height} game units
                  </span>
                  <span className="ww-coin-line">
                    <Icon name="coin" size={16} /> {boardPrice(state, woodId, size.id)}
                  </span>
                  {fits ? (
                    <span className="ww-timber__badge">
                      <Icon name="check" size={14} /> Fits your plan{still > 0 ? ` · need ${still}` : ""}
                    </span>
                  ) : null}
                </div>
                <div className="ww-timber__stepper" role="group" aria-label={`${size.name} in your cart`}>
                  <button
                    type="button"
                    onClick={() => change(size.id, -1)}
                    aria-label={`One fewer ${size.name}`}
                    disabled={cart[size.id] === 0}
                  >
                    −
                  </button>
                  <output aria-live="polite">{cart[size.id]}</output>
                  <button
                    type="button"
                    onClick={() => change(size.id, 1)}
                    aria-label={`One more ${size.name}`}
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="ww-timber__actions">
          <Button
            variant="secondary"
            onClick={buyCart}
            disabledReason={
              sizes.length === 0
                ? "Add boards to your cart."
                : cartCheck.ok
                  ? undefined
                  : cartCheck.reasons[0]
            }
            data-testid="buy-cart"
          >
            <Icon name="coin" size={16} /> Buy cart · {total}
          </Button>
          <Button
            onClick={buyPlan}
            icon="sparkle"
            disabledReason={
              planList.length === 0
                ? "You already have the boards for your plan."
                : planCheck.ok
                  ? undefined
                  : planCheck.reasons[0]
            }
            showReason
            data-testid="buy-plan"
          >
            Buy what fits my plan
          </Button>
        </div>
      </div>
      <section className="ww-timber__owned" aria-labelledby="ww-owned-title">
        <h2 id="ww-owned-title" className="ww-timber__owned-title">
          On your rack: {owned.length} {owned.length === 1 ? "board" : "boards"} of {wood.name}
        </h2>
        {owned.length === 0 ? (
          <p className="ww-muted">Nothing yet. Old boards and spare pieces of this wood show up here.</p>
        ) : (
          <ul className="ww-timber__owned-list">
            {owned.map((board) => (
              <li key={board.id}>
                <BoardThumb board={board} className={`ww-timber__thumb ww-timber__thumb--${board.size}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <StageFooter {...props} ready="Boards on the rack. Time to plan the cuts!" />
    </div>
  );
}
