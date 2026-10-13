import { Component, Suspense, type ReactNode } from "react";
import { Button } from "../ui/kit/Button";
import { Card } from "../ui/kit/Card";

interface ViewLoadBoundaryProps {
  readonly children: ReactNode;
}

interface ViewLoadBoundaryState {
  readonly failed: boolean;
}

export class ViewLoadBoundary extends Component<ViewLoadBoundaryProps, ViewLoadBoundaryState> {
  state: ViewLoadBoundaryState = { failed: false };

  static getDerivedStateFromError(): ViewLoadBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed)
      return (
        <main className="ad-view-state">
          <Card role="alert" data-testid="view-load-failed">
            <p>This part of the studio didn't load. Reload to continue — your progress is saved.</p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </Card>
        </main>
      );
    return (
      <Suspense
        fallback={
          <main className="ad-view-state" aria-busy="true">
            <Card data-testid="view-loading">
              <p className="ad-view-state__loading ad-muted" role="status">
                Opening the studio…
              </p>
            </Card>
          </main>
        }
      >
        {this.props.children}
      </Suspense>
    );
  }
}
