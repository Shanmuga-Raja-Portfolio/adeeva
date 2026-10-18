import { Button } from "../ui/kit/Button";
import { Icon } from "../ui/kit/IconSet";
import { useUpdateReady } from "../offline/useUpdateReady";
import { dismissUpdate, restartIntoUpdate } from "../offline/workerUpdates";
import "./updateNotice.css";

export function UpdateNotice() {
  const ready = useUpdateReady();
  return (
    <div className="st-update-region" role="status" aria-live="polite">
      {ready ? (
        <div className="st-update" data-testid="update-notice">
          <span className="st-update__icon">
            <Icon name="sparkle" size={18} />
          </span>
          <p>A new version is ready — restart when you like.</p>
          <span className="st-update__actions">
            <Button size="sm" onClick={restartIntoUpdate}>
              Restart
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissUpdate}>
              Later
            </Button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
