import type { AvatarLook } from "../../../../../engine/avatar";
import { colourById } from "../../../../../engine/palette";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { clientById, offersFor, type Brief, type GameState } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import type { BakeLook } from "../../art/bakeLook";

export interface CounterCustomerProps {
  readonly state: GameState;
}

interface Visit {
  readonly name: string;
  readonly look: AvatarLook;
  readonly brief: Brief;
}

function nextVisit(state: GameState): Visit | null {
  const offer = offersFor(state)[0];
  if (offer !== undefined)
    return { name: offer.client.name, look: offer.client.look, brief: offer.offer.brief };
  const gig = state.gigs.active[0];
  const client = gig === undefined ? undefined : clientById(gig.clientId);
  if (gig === undefined || client === undefined) return null;
  return { name: client.name, look: client.look, brief: gig.brief };
}

function wishLook(brief: Brief): BakeLook | null {
  const productId = brief.products[0];
  if (productId === undefined) return null;
  const icing = brief.favouredColours.map((id) => colourById(id).hex);
  return {
    productId,
    mixColours: [],
    fillingColour: null,
    icing: icing.length > 0 ? icing : ["#fbf3e2"],
    pattern: "a",
    toppings: [],
    iced: true,
  };
}

export function CounterCustomer({ state }: CounterCustomerProps) {
  const visit = nextVisit(state);
  if (visit === null) return null;
  const look = wishLook(visit.brief);
  return (
    <div className="pa-customer" aria-hidden="true" data-testid="counter-customer">
      {look !== null ? (
        <div className="pa-customer__wish">
          <BakePreview look={look} title={null} className="pa-customer__treat" />
          <span className="pa-customer__dot pa-customer__dot--big" />
          <span className="pa-customer__dot" />
        </div>
      ) : null}
      <div className="pa-customer__figure">
        <Avatar variant="full" look={visit.look} mood="happy" pose="graceful" title={visit.name} />
      </div>
    </div>
  );
}
