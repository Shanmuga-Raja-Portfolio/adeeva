import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import type { SaveSlotId, SlotRead } from "../../patisserieSlots";
import "./settings.css";

export interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly slots: readonly SlotRead[];
  readonly activeSlot: SaveSlotId | null;
  readonly onDeleteSlot: (slot: SaveSlotId) => void;
}

function summary(read: SlotRead): string {
  if (read.kind === "empty") return "Empty";
  if (read.kind === "damaged") return "Damaged save";
  return `${read.state.profile.name} · Day ${read.state.calendar.day}`;
}

export function SettingsDialog({ open, onClose, slots, activeSlot, onDeleteSlot }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();
  const [confirming, setConfirming] = useState<SaveSlotId | null>(null);
  const close = () => {
    setConfirming(null);
    onClose();
  };
  return (
    <Dialog
      open={open}
      title="Settings"
      onClose={close}
      footer={
        <Button variant="secondary" onClick={close}>
          Done
        </Button>
      }
    >
      <ToggleSwitch
        label="Reduce motion"
        description="Calmer screens: colour bars instead of rising cakes."
        checked={settings.reducedMotion}
        onChange={(reducedMotion) => updateSettings({ reducedMotion })}
      />
      <h3 className="pa-settings__heading">Saved bakeries</h3>
      <ul className="pa-settings__slots">
        {slots.map((read) => (
          <li key={read.slot} className="pa-settings__slot">
            <span>
              <strong>Slot {read.slot}</strong> <span className="pa-muted">{summary(read)}</span>
            </span>
            {read.kind === "empty" ? null : read.slot === activeSlot ? (
              <span className="pa-muted">Playing now</span>
            ) : confirming === read.slot ? (
              <span className="pa-settings__confirm">
                <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                  Keep
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onDeleteSlot(read.slot);
                    setConfirming(null);
                  }}
                >
                  Delete for good
                </Button>
              </span>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirming(read.slot)}>
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
