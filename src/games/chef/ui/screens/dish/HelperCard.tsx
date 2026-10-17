import type { ReactNode } from "react";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useAssist, type AssistStep } from "../../useAssist";
import { HELPERS } from "../settings/SettingsDialog";

export interface HelperCardProps {
  readonly step: AssistStep;
  readonly note?: ReactNode;
  readonly compact?: boolean | undefined;
}

export function HelperCard({ step, note, compact = false }: HelperCardProps) {
  const [assist, setAssist] = useAssist(step);
  const helper = HELPERS.find((entry) => entry.step === step);
  if (helper === undefined) return null;
  return (
    <div className={assist ? "ck-helper-card ck-helper-card--on" : "ck-helper-card"}>
      <ToggleSwitch
        label={helper.label}
        description={compact ? undefined : helper.description}
        checked={assist}
        onChange={setAssist}
      />
      {note}
    </div>
  );
}
