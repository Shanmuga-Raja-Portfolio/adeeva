import { Button } from "../../../../../ui/kit/Button";
import { useShowClock } from "../../../../../ui/kit/useShowClock";
import type { PriceTagId } from "../../../content/priceTag";
import type { PopupBoardRow } from "../../../core";
import { PopupScene } from "./PopupScene";

export interface PopupStrollProps {
  readonly opened: {
    readonly rows: readonly PopupBoardRow[];
    readonly tags: Readonly<Record<string, PriceTagId>>;
    readonly plinth: string;
  };
  readonly lineName: string;
  readonly lantern: string;
  readonly reduced: boolean;
  readonly onDone: () => void;
}

const STROLL_MS = 15000;

function StrollClock(props: Omit<PopupStrollProps, "reduced">) {
  const elapsed = useShowClock(STROLL_MS, props.onDone);
  return <StrollView {...props} reduced={false} t={elapsed / STROLL_MS} />;
}

export function PopupStroll(props: PopupStrollProps) {
  return props.reduced ? <StrollView {...props} t={1} /> : <StrollClock {...props} />;
}

function StrollView({
  opened,
  lineName,
  lantern,
  reduced,
  onDone,
  t,
}: PopupStrollProps & { readonly t: number }) {
  const shown = opened.rows.map((row, index) =>
    Math.min(row.hearts, Math.floor(t * (row.hearts + 1) * 1.15 + (index % 2) * 0.3)),
  );
  return (
    <section className="jb-popup__stroll" aria-label="Visitors at your window" data-testid="popup-stroll">
      <PopupScene
        rows={opened.rows.map((row) => ({
          piece: row.piece,
          hearts: row.hearts,
          tag: opened.tags[row.piece.id] ?? "gentle",
        }))}
        plinth={opened.plinth}
        lineName={lineName}
        lantern={lantern}
        shownHearts={shown}
        walkers={reduced ? -1 : t}
        label="Visitors stroll past and drop hearts into the velvet pots"
      />
      <p className="jb-launch-reveal__caption" aria-live="polite">
        {reduced
          ? `Visitors left ${opened.rows.reduce((sum, row) => sum + row.hearts, 0)} hearts in the velvet pots.`
          : "Visitors stroll past your window and drop hearts into the velvet pots…"}
      </p>
      <div className="jb-launch-board__foot">
        <Button
          variant={reduced ? "primary" : "secondary"}
          onClick={onDone}
          autoFocus
          data-testid="skip-stroll"
        >
          {reduced ? "See how it went" : "Skip to the sales ›"}
        </Button>
      </div>
    </section>
  );
}
