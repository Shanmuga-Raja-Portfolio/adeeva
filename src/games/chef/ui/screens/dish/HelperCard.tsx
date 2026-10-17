import type { ReactNode } from "react";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { HINTS } from "../../../content/hints";
import { useAssist, type AssistStep } from "../../useAssist";
import { HELPERS } from "../settings/SettingsDialog";

export function HelperCard({ step, note }: { readonly step: AssistStep; readonly note?: ReactNode }) {
  const [assist, setAssist] = useAssist(step);
  const helper = HELPERS.find((entry) => entry.step === step);
  if (helper === undefined) return null;
  return (
    <div className={assist ? "ck-helper-card ck-helper-card--on" : "ck-helper-card"}>
      <ToggleSwitch
        label={helper.label}
        description={`${helper.description} ${HINTS.assist}`}
        checked={assist}
        onChange={setAssist}
      />
      {note}
    </div>
  );
}
