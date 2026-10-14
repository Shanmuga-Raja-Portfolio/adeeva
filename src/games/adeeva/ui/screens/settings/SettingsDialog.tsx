import { useState } from "react";
import type { SaveSlotId, SlotRead } from "../../adeevaSlots";
import { useSettings } from "../../../../../studio/SettingsContext";
import { ASSIST_SEW_ACCURACY_CAP } from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { slotSummary } from "../../../../../studio/slotSummary";
import "./settings.css";

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  slots: readonly SlotRead[];
  activeSlot: SaveSlotId | null;
  onDeleteSlot: (slot: SaveSlotId) => void;
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
      <section className="ad-settings__section">
        <h3 className="ad-settings__heading">Comfort</h3>
        <ToggleSwitch
          label="Reduce motion"
          description="Calmer screens with fewer animations."
          checked={settings.reducedMotion}
          onChange={(reducedMotion) => updateSettings({ reducedMotion })}
        />
        <ToggleSwitch
          label="Assist cutting"
          description="Start each cut with the steady-hand helper switched on."
          checked={settings.assistCut}
          onChange={(assistCut) => updateSettings({ assistCut })}
        />
        <ToggleSwitch
          label="Assist sewing"
          description={`Assist sewing widens the guide so it is easier to stay on the line. Assisted seams count up to ${Math.round(ASSIST_SEW_ACCURACY_CAP * 100)}%.`}
          checked={settings.assistSew}
          onChange={(assistSew) => updateSettings({ assistSew })}
        />
      </section>
      <section className="ad-settings__section">
        <h3 className="ad-settings__heading">Saved games</h3>
        <ul className="ad-settings__slots">
          {slots.map((read) => (
            <li key={read.slot} className="ad-settings__slot">
              <span>
                <strong>Slot {read.slot}</strong>
                <span className="ad-settings__slot-meta">{slotSummary(read)}</span>
              </span>
              {read.kind === "empty" ? null : read.slot === activeSlot ? (
                <span className="ad-settings__slot-meta">Playing now</span>
              ) : confirming === read.slot ? (
                <span className="ad-settings__confirm">
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
      </section>
    </Dialog>
  );
}
