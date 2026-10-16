import { PLOTS } from "../../../content/plot";
import { keyById, type KeyWall } from "../../../core";
import { KeyArt } from "../../art/KeyArt";

interface KeyWallBoardProps {
  readonly keyWall: KeyWall;
  readonly current: number;
  readonly phase: number;
}

export function KeyWallBoard({ keyWall, current, phase }: KeyWallBoardProps) {
  return (
    <section className="is-key-wall" aria-labelledby="is-key-wall-title" data-testid="key-wall">
      <header>
        <span className="ad-eyebrow">{phase > 1 ? `Larkspur Close, phase ${phase}` : "The site cabin"}</span>
        <h3 id="is-key-wall-title">The Key Wall</h3>
      </header>
      <ol className="is-key-wall__hooks">
        {PLOTS.map((plot) => {
          const key = keyWall[plot.id];
          return (
            <li
              key={plot.id}
              className={
                plot.number === current ? "is-key-wall__hook is-key-wall__hook--current" : "is-key-wall__hook"
              }
              data-testid={`hook-${plot.id}`}
            >
              <KeyArt
                keyId={key}
                size={56}
                label={key === null ? `${plot.name}: no key yet` : `${plot.name}: ${keyById(key).name}`}
              />
              <span className="is-key-wall__plot" style={{ borderColor: plot.door }}>
                {plot.number}. {plot.name}
              </span>
              <span className="is-key-wall__key">{key === null ? "Waiting" : keyById(key).name}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
