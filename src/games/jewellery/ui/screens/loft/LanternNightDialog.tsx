import { lateShowPenalty } from "../../../../../engine/showDay";
import type { DifficultyId } from "../../../../../engine/difficulty";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { LATE_LAUNCH_HOURS } from "../../../core";

export interface LanternNightDialogProps {
  readonly open: boolean;
  readonly difficulty: DifficultyId;
  readonly onStage: () => void;
  readonly onEndAnyway: (event: ClickLike) => void;
  readonly onClose: () => void;
}

export function LanternNightDialog({
  open,
  difficulty,
  onStage,
  onEndAnyway,
  onClose,
}: LanternNightDialogProps) {
  const late =
    lateShowPenalty(true, difficulty) > 0
      ? `A late Launch tomorrow takes ${LATE_LAUNCH_HOURS} hours and the panels count a few points less.`
      : `A late Launch tomorrow takes ${LATE_LAUNCH_HOURS} hours.`;
  return (
    <Dialog
      open={open}
      title="The lanterns are lit tonight!"
      onClose={onClose}
      footer={
        <>
          <Button autoFocus icon="sparkle" onClick={onStage} data-testid="night-stage-first">
            Stage the Launch
          </Button>
          <Button variant="ghost" onClick={onEndAnyway} data-testid="night-end-anyway">
            End the day anyway
          </Button>
        </>
      }
    >
      <p>Stage your Launch first? Your line is ready and the crowd is gathering.</p>
      <p className="jb-muted">{late}</p>
    </Dialog>
  );
}
