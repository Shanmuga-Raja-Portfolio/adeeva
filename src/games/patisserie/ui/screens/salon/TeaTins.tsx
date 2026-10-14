import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { useToast } from "../../../../../studio/ToastContext";
import { TEAS } from "../../../content/tea";
import { canBuy, type Action, type GameState } from "../../../core";
import "./teaTins.css";

export interface TeaTinsProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

export function TeaTins({ state, dispatch }: TeaTinsProps) {
  const once = useDispatchOnce(state, dispatch);
  const toast = useToast();
  return (
    <div className="pa-tea-tins" data-testid="tea-tins">
      <span className="ad-eyebrow">Tea tins</span>
      <ul>
        {TEAS.map((tea) => {
          const cart = { ingredients: {}, gels: [], fillings: {}, toppings: {}, teas: { [tea.id]: 1 } };
          const check = canBuy(state, cart);
          return (
            <li key={tea.id}>
              <span className="pa-tea-tins__tin" style={{ background: tea.colour }} aria-hidden="true" />
              <span className="pa-tea-tins__name">
                {tea.name}
                <span className="pa-muted"> · {state.pantry.teas[tea.id]} cups</span>
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={(event) => {
                  if (once(event, { type: "buyPantry", cart }))
                    toast(`A tin of ${tea.name} is on the shelf. +${tea.cupsPerTin} cups`);
                }}
                disabledReason={check.ok ? undefined : check.reasons[0]}
                aria-label={`Buy a tin of ${tea.name} for ${tea.price} coins`}
              >
                Buy <Icon name="coin" size={14} /> {tea.price}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
