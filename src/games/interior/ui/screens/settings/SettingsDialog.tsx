import { useState } from "react";
import { ASSIST_ACCURACY_CAP } from "../../../../../engine/assistCap";
import { slotSummary } from "../../../../../studio/slotSummary";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { CHALLENGING_ASSIST_CAP } from "../../../core";
import type { SaveSlotId, SlotRead } from "../../interiorSlots";
import { useAssistChoices, type AssistStep } from "../../useAssist";
import "./settings.css";

export interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly slots: readonly SlotRead[];
  readonly activeSlot: SaveSlotId | null;
  readonly onDeleteSlot: (slot: SaveSlotId) => void;
}

const HELPERS: readonly {
  readonly step: AssistStep;
  readonly label: string;
  readonly description: string;
}[] = [
  { step: "plan", label: "Tidy up helper", description: "A Tidy up button arranges your furniture for you." },
  {
    step: "paint",
    label: "Steady brush",
    description: "The brush rides the tape and the roller fills the wall.",
  },
  { step: "floor", label: "Floor magnet", description: "The right piece glows and snaps into place." },
  {
    step: "light",
    label: "Show me lights",
    description: "A Show me button hangs the next light in a good spot.",
  },
];

export function SettingsDialog({ open, onClose, slots, activeSlot, onDeleteSlot }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();
  const assist = useAssistChoices();
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
        description="Calmer screens: no splat flicks, swaying lamps or walking visitors."
        checked={settings.reducedMotion}
        onChange={(reducedMotion) => updateSettings({ reducedMotion })}
      />
      <h3 className="is-settings__heading">Helpers</h3>
      <p className="is-muted is-settings__note">
        Every helper makes a step easier. A step done with a helper counts up to{" "}
        {Math.round(100 * ASSIST_ACCURACY_CAP)}%, or {Math.round(100 * CHALLENGING_ASSIST_CAP)}% on
        Challenging.
      </p>
      {HELPERS.map((helper) => (
        <ToggleSwitch
          key={helper.step}
          label={helper.label}
          description={helper.description}
          checked={assist.choices[helper.step]}
          onChange={(on) => assist.set(helper.step, on)}
        />
      ))}
      <h3 className="is-settings__heading">Saved lofts</h3>
      <ul className="is-settings__slots">
        {slots.map((read) => (
          <li key={read.slot} className="is-settings__slot">
            <span>
              <strong>Slot {read.slot}</strong> <span className="is-muted">{slotSummary(read)}</span>
            </span>
            {read.kind === "empty" ? null : read.slot === activeSlot ? (
              <span className="is-muted">Playing now</span>
            ) : confirming === read.slot ? (
              <span className="is-settings__confirm">
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
