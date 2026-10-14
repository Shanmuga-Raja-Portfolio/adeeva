import { useState } from "react";
import { slotSummary } from "../../../../../studio/slotSummary";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import type { SaveSlotId, SlotRead } from "../../chefSlots";
import { useKitchenSound } from "../../sound/SoundContext";
import { useAssistChoices, type AssistStep } from "../../useAssist";
import "./settings.css";

export interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly slots: readonly SlotRead[];
  readonly activeSlot: SaveSlotId | null;
  readonly onDeleteSlot: (slot: SaveSlotId) => void;
}

export const HELPERS: readonly {
  readonly step: AssistStep;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    step: "chop",
    label: "Auto-rhythm",
    description: "Hold the board and the knife keeps the beat. Minces do themselves.",
  },
  {
    step: "sizzle",
    label: "Pan helper",
    description: "The heat is set for you, and a bell says when to flip.",
  },
  {
    step: "simmer",
    label: "Steady ladle",
    description: "A wider glow, and the pot stops on the line by itself.",
  },
  { step: "taste", label: "Taste helper", description: "See the taste point and an arrow to the next jar." },
  { step: "plate", label: "Ghost plate", description: "A faint layout shows where each piece could go." },
];

export function SettingsDialog({ open, onClose, slots, activeSlot, onDeleteSlot }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();
  const sound = useKitchenSound();
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
        label="Kitchen sounds"
        description="Soft chops, sizzles and the pass bell. Made right here, with nothing downloaded."
        checked={!sound.muted}
        onChange={(on) => sound.setMuted(!on)}
      />
      <ToggleSwitch
        label="Reduce motion"
        description="Calmer screens: marks step instead of scroll, and steam stays still."
        checked={settings.reducedMotion}
        onChange={(reducedMotion) => updateSettings({ reducedMotion })}
      />
      <h3 className="ck-settings__heading">Helpers</h3>
      <p className="ck-muted ck-settings__note">
        Every helper makes a step easier. A step done with a helper counts up to 80%.
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
      <h3 className="ck-settings__heading">Saved kitchens</h3>
      <ul className="ck-settings__slots">
        {slots.map((read) => (
          <li key={read.slot} className="ck-settings__slot">
            <span>
              <strong>Slot {read.slot}</strong> <span className="ck-muted">{slotSummary(read)}</span>
            </span>
            {read.kind === "empty" ? null : read.slot === activeSlot ? (
              <span className="ck-muted">Playing now</span>
            ) : confirming === read.slot ? (
              <span className="ck-settings__confirm">
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
