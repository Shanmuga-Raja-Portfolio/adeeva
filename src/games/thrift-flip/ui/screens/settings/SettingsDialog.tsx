import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import "../../../../adeeva/ui/screens/settings/settings.css";
import {
  ASSIST_CLEAN_CAP,
  ASSIST_CUT_ACCURACY,
  ASSIST_SEW_ACCURACY_CAP,
  ASSIST_UNPICK_CAP,
} from "../../../core";
import type { SaveSlotId, SlotRead } from "../../thriftSlots";
import { slotSummary } from "../../../../../studio/slotSummary";

export interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly slots: readonly SlotRead[];
  readonly activeSlot: SaveSlotId | null;
  readonly onDeleteSlot: (slot: SaveSlotId) => void;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
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
          label="Assist snipping"
          description={`Tap a stitch to pop it. Counts up to ${percent(ASSIST_UNPICK_CAP)}.`}
          checked={settings.assistUnpick}
          onChange={(assistUnpick) => updateSettings({ assistUnpick })}
        />
        <ToggleSwitch
          label="Assist scrubbing"
          description={`Soak every stain with one tap. Counts up to ${percent(ASSIST_CLEAN_CAP)}.`}
          checked={settings.assistClean}
          onChange={(assistClean) => updateSettings({ assistClean })}
        />
        <ToggleSwitch
          label="Assist cutting"
          description={`Skip tracing: pieces are cut at a steady ${percent(ASSIST_CUT_ACCURACY)}.`}
          checked={settings.assistCut}
          onChange={(assistCut) => updateSettings({ assistCut })}
        />
        <ToggleSwitch
          label="Assist sewing"
          description={`A wider guide line. Assisted seams count up to ${percent(ASSIST_SEW_ACCURACY_CAP)}.`}
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
