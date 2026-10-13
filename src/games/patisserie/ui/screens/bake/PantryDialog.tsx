import { Dialog } from "../../../../../ui/kit/Dialog";
import { PantryShop, type PantryShopProps } from "./PantryShop";

export interface PantryDialogProps extends PantryShopProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function PantryDialog({ open, onClose, ...shop }: PantryDialogProps) {
  return (
    <Dialog
      open={open}
      title="A quick pantry trip"
      onClose={onClose}
      className="ad-dialog--wide pa-pantry-dialog"
    >
      <PantryShop {...shop} />
    </Dialog>
  );
}
