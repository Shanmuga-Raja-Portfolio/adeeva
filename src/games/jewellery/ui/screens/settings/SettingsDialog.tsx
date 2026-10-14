import { useState } from "react";
import { slotSummary } from "../../../../../studio/slotSummary";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import type { SaveSlotId, SlotRead } from "../../jewellerySlots";
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
  {
    step: "cut",
    label: "Guide rail for cutting",
    description: "The saw follows the line and turns by itself.",
  },
  { step: "join", label: "Steady lamp", description: "The lamp keeps the glow in the gold zone." },
  { step: "set", label: "Gentle tweezers", description: "The stone slides home and the claws close." },
  { step: "polish", label: "Buffing wheel", description: "The wheel polishes the whole piece." },
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
        description="Calmer screens: no flicker, falling shavings or strolling shoppers."
        checked={settings.reducedMotion}
        onChange={(reducedMotion) => updateSettings({ reducedMotion })}
      />
      <h3 className="jb-settings__heading">Helpers</h3>
      <p className="jb-muted jb-settings__note">
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
      <h3 className="jb-settings__heading">Saved benches</h3>
      <ul className="jb-settings__slots">
        {slots.map((read) => (
          <li key={read.slot} className="jb-settings__slot">
            <span>
              <strong>Slot {read.slot}</strong> <span className="jb-muted">{slotSummary(read)}</span>
            </span>
            {read.kind === "empty" ? null : read.slot === activeSlot ? (
              <span className="jb-muted">Playing now</span>
            ) : confirming === read.slot ? (
              <span className="jb-settings__confirm">
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
