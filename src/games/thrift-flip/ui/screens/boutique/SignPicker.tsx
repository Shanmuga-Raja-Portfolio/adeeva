import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { SHOP_SIGNS, type ShopSignId } from "../../../content/shopSign";
import { BoutiqueBackdrop } from "../../art/BoutiqueBackdrop";
import "./boutique.css";

export interface SignPickerProps {
  readonly open: boolean;
  readonly onPick: (signId: ShopSignId) => void;
  readonly onClose: () => void;
}

export function SignPicker({ open, onPick, onClose }: SignPickerProps) {
  const [chosen, setChosen] = useState<ShopSignId>("second-bloom");
  return (
    <Dialog
      open={open}
      title="Paint the new shop sign"
      onClose={onClose}
      className="tf-sign-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button icon="sparkle" onClick={() => onPick(chosen)} data-testid="confirm-sign">
            Hang the sign
          </Button>
        </>
      }
    >
      <p className="ad-muted">Pick a name for Mrs. Pell&apos;s old sewing shop. It goes up over the door.</p>
      <div className="tf-signs" role="radiogroup" aria-label="Shop sign">
        {SHOP_SIGNS.map((sign) => (
          <button
            key={sign.id}
            type="button"
            role="radio"
            aria-checked={chosen === sign.id}
            className={chosen === sign.id ? "tf-sign tf-sign--chosen" : "tf-sign"}
            onClick={() => setChosen(sign.id)}
            data-testid={`sign-${sign.id}`}
          >
            <span className="tf-sign__window">
              <BoutiqueBackdrop signName={sign.name} />
            </span>
            <strong>{sign.name}</strong>
            <span>{sign.motto}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
