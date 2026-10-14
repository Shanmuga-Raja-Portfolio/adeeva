import type { ReactNode } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CHAIN_IDS, CHARM_IDS, CLIP_SET, isCharmId } from "../../../content/extra";
import { jewelColourById } from "../../../content/jewelColour";
import { STOCK_SIZES } from "../../../content/stockSize";
import {
  canBuySupplies,
  cartCost,
  EMPTY_CART,
  extraById,
  hasShortfall,
  metalById,
  productById,
  shortfall,
  stockPrice,
  stoneById,
  supplyVisitHours,
  type SupplyCart,
} from "../../../core";
import { CharmArt } from "../../art/CharmArt";
import { metalLook } from "../../art/metalLook";
import { MiniIcon } from "../../art/MiniIcon";
import { StoneArt } from "../../art/StoneArt";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./supplies.css";

interface ItemCardProps {
  readonly name: string;
  readonly art: ReactNode;
  readonly price: number;
  readonly owned: number;
  readonly fits: boolean;
  readonly reason: string | undefined;
  readonly onBuy: (event: ClickLike) => void;
}

function ItemCard({ name, art, price, owned, fits, reason, onBuy }: ItemCardProps) {
  return (
    <li className={fits ? "jb-item jb-item--fits" : "jb-item"}>
      {fits ? <span className="jb-item__badge">Fits your plan</span> : null}
      <span className="jb-item__art" aria-hidden="true">
        {art}
      </span>
      <strong className="jb-item__name">{name}</strong>
      <span className="jb-item__owned">You have {owned}</span>
      <Button
        size="sm"
        variant={fits ? "primary" : "secondary"}
        onClick={onBuy}
        disabledReason={reason}
        aria-label={`Buy ${name} for ${price} coins`}
      >
        <Icon name="coin" size={14} /> {price}
      </Button>
    </li>
  );
}

export function SuppliesStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const product = productById(run.design.productId);
  const missing = shortfall(state, run);
  const metalId = run.design.metalId;
  const stoneId = run.design.stoneId;
  const visitHours = supplyVisitHours(state);
  const buy = (event: ClickLike, cart: SupplyCart, label: string) => {
    if (once(event, { type: "buySupplies", cart })) toast(`${label} is in your drawers.`);
  };
  const reasonFor = (cart: SupplyCart) => {
    const check = canBuySupplies(state, cart);
    return check.ok ? undefined : check.reasons[0];
  };
  const look = metalLook(metalId, "high-shine");
  return (
    <div className="jb-supplies">
      <section className="jb-cabinet">
        <header className="jb-cabinet__head">
          <div>
            <h2>Everything for this piece</h2>
            <p className="jb-muted">
              {visitHours > 0
                ? "Your first buy on this visit takes 1 hour."
                : "You're already here. Buy as much as you like."}
            </p>
          </div>
          {hasShortfall(missing) ? (
            <Button
              size="lg"
              icon="bag"
              onClick={(event) => buy(event, missing, "Everything you need")}
              disabledReason={reasonFor(missing)}
              showReason
              data-testid="buy-fits"
            >
              Buy what fits · {cartCost(missing)}
            </Button>
          ) : (
            <p className="jb-cabinet__ready">
              <Icon name="check" size={18} /> You have everything for this piece.
            </p>
          )}
        </header>
        {metalId !== null ? (
          <div className="jb-drawer-row">
            <h3>
              <MiniIcon name="sheet" /> {metalById(metalId).name} drawer
            </h3>
            <ul className="jb-items">
              {STOCK_SIZES.map((size) => {
                const cart: SupplyCart = { ...EMPTY_CART, metal: [{ metalId, size: size.id, count: 1 }] };
                return (
                  <ItemCard
                    key={size.id}
                    name={`${metalById(metalId).name} ${size.name.toLowerCase()}`}
                    art={
                      <svg viewBox="0 0 84 44">
                        <rect
                          x={42 - size.width / 2}
                          y={22 - size.height / 2}
                          width={size.width}
                          height={size.height}
                          rx={2}
                          fill={look.mid}
                          stroke={look.line}
                        />
                        <path
                          d={`M${44 - size.width / 2} ${24 - size.height / 2} l${size.width * 0.5} 0`}
                          stroke={look.light}
                          strokeWidth={2}
                        />
                      </svg>
                    }
                    price={stockPrice(metalId, size.id)}
                    owned={state.stock.metal[metalId][size.id]}
                    fits={missing.metal.some((line) => line.size === size.id)}
                    reason={reasonFor(cart)}
                    onBuy={(event) => buy(event, cart, `A ${size.name.toLowerCase()}`)}
                  />
                );
              })}
            </ul>
          </div>
        ) : null}
        {stoneId !== null && product.seats.length > 0 ? (
          <div className="jb-drawer-row">
            <h3>
              <MiniIcon name="gem" /> Stone tray
            </h3>
            <ul className="jb-items">
              <ItemCard
                name={stoneById(stoneId).name}
                art={
                  <svg viewBox="-22 -22 44 44">
                    <StoneArt
                      cut={stoneById(stoneId).cut}
                      hex={jewelColourById(stoneById(stoneId).colour).hex}
                      x={0}
                      y={0}
                      size={32}
                    />
                  </svg>
                }
                price={stoneById(stoneId).price}
                owned={state.stock.stones[stoneId]}
                fits={missing.stones[stoneId] !== undefined}
                reason={reasonFor({ ...EMPTY_CART, stones: { [stoneId]: 1 } })}
                onBuy={(event) =>
                  buy(event, { ...EMPTY_CART, stones: { [stoneId]: 1 } }, stoneById(stoneId).name)
                }
              />
            </ul>
          </div>
        ) : null}
        <div className="jb-drawer-row">
          <h3>
            <MiniIcon name="glint" /> Chain rail and charm jar
          </h3>
          <ul className="jb-items">
            {[...CHAIN_IDS, ...CHARM_IDS].map((id) => {
              const extra = extraById(id);
              const cart: SupplyCart = { ...EMPTY_CART, extras: { [id]: 1 } };
              return (
                <ItemCard
                  key={id}
                  name={extra.name}
                  art={
                    <svg viewBox="-22 -22 44 44">
                      {isCharmId(id) ? (
                        <g transform="translate(0 4)">
                          <CharmArt charmId={id} />
                        </g>
                      ) : (
                        <path
                          d="M-18 -8 C-8 14 8 14 18 -8"
                          fill="none"
                          stroke={id === "silk-cord" ? "#b9a7dc" : look.mid}
                          strokeWidth={id === "rope-chain" ? 4 : 2.4}
                          strokeDasharray={id === "silk-cord" ? undefined : "3 1.4"}
                        />
                      )}
                    </svg>
                  }
                  price={extra.price}
                  owned={state.stock.extras[id]}
                  fits={missing.extras[id] !== undefined}
                  reason={reasonFor(cart)}
                  onBuy={(event) => buy(event, cart, extra.name)}
                />
              );
            })}
            {product.clipSets > 0 ? (
              <ItemCard
                name={CLIP_SET.name}
                art={
                  <svg viewBox="-22 -22 44 44">
                    <rect x={-14} y={-8} width={12} height={10} rx={5} fill="#e9e4dc" stroke="#8c8278" />
                    <rect x={2} y={-8} width={12} height={10} rx={5} fill="#e9e4dc" stroke="#8c8278" />
                    <circle cx={0} cy={10} r={5} fill="none" stroke={look.mid} strokeWidth={2} />
                  </svg>
                }
                price={CLIP_SET.price}
                owned={state.stock.clips}
                fits={missing.clips > 0}
                reason={reasonFor({ ...EMPTY_CART, clips: 1 })}
                onBuy={(event) => buy(event, { ...EMPTY_CART, clips: 1 }, CLIP_SET.name)}
              />
            ) : null}
          </ul>
        </div>
      </section>
      <StageFooter {...props} ready="Your drawers are full. Let's plan the sheet!" />
    </div>
  );
}
