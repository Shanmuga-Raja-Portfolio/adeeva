import { Button } from "../ui/kit/Button";
import { Icon } from "../ui/kit/IconSet";
import { useSignedOut } from "../offline/useSignedOut";
import { useUpdateReady } from "../offline/useUpdateReady";
import { signInAgain } from "../offline/signInState";
import "./signedOutMark.css";

export function SignedOutMark() {
  const signedOut = useSignedOut();
  const updateShowing = useUpdateReady();
  return (
    <span className="st-signed-out-slot" role="status" aria-live="polite">
      {signedOut && !updateShowing ? (
        <span className="st-signed-out" data-testid="signed-out-mark">
          <Icon name="lock" size={16} />
          <span className="st-signed-out__words">
            <strong>Signed out</strong>
            <span className="st-signed-out__calm">Your games and saves still work</span>
          </span>
          <Button size="sm" variant="ghost" onClick={signInAgain}>
            Sign in
          </Button>
        </span>
      ) : null}
    </span>
  );
}
