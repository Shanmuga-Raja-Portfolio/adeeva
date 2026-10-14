import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { Avatar, skinHex } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canReveal, clientById, roomById } from "../../../core";
import { RoomCutaway } from "../../art/RoomCutaway";
import { BARE, FINISHED, roomLook } from "../../art/roomLook";
import type { StageProps } from "./stageProps";
import "./reveal.css";

const READY = 92;

export function RevealStage({ state, run, dispatch, onExit }: StageProps) {
  const once = useDispatchOnce(state, dispatch);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    focusHeading();
  }, []);
  const trackRef = useRef<HTMLDivElement>(null);
  const [share, setShare] = useState(0);
  const [dragging, setDragging] = useState(false);
  const client = clientById(run.brief.clientId);
  const check = canReveal(state);
  const ready = share >= READY && check.ok;

  const fromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect === undefined || rect.width === 0) return;
    setShare(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)));
  };

  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? 10
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -10
          : 0;
    if (event.key === "End") setShare(100);
    if (event.key === "Home") setShare(0);
    if (step === 0) return;
    event.preventDefault();
    setShare((value) => Math.max(0, Math.min(100, value + step)));
  };

  return (
    <div className="is-reveal" data-testid="reveal-stage">
      <header className="is-reveal__header">
        <Button variant="ghost" icon="back" onClick={onExit}>
          Back to the loft
        </Button>
        <div>
          <span className="ad-eyebrow">{roomById(run.brief.roomId).name}</span>
          <h1>The big reveal</h1>
        </div>
      </header>
      <div className="is-reveal__scene">
        {client !== undefined ? (
          <div className="is-reveal__client">
            <div className="is-reveal__face">
              <Avatar
                look={client.look}
                mood={share > 60 ? "happy" : "neutral"}
                size={150}
                title={`${client.name}, eyes covered`}
                frameColour="#fcefc2"
              />
              {ready ? null : (
                <svg viewBox="0 0 150 150" className="is-reveal__hands" aria-hidden="true">
                  {[56, 94].map((x, index) => (
                    <g key={x} transform={`translate(${x} 68) rotate(${index === 0 ? -12 : 12})`}>
                      <rect
                        x={-19}
                        y={-13}
                        width={38}
                        height={26}
                        rx={12}
                        fill={skinHex(client.look)}
                        stroke="#3b2a33"
                        strokeWidth={2}
                      />
                      <path
                        d="M-9 -12 L-9 4 M0 -13 L0 5 M9 -12 L9 4"
                        stroke="#3b2a33"
                        strokeOpacity={0.45}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                    </g>
                  ))}
                </svg>
              )}
            </div>
            <p className="is-reveal__bubble">{ready ? "Can I look now?" : "No peeking! I promise."}</p>
          </div>
        ) : null}
        <div className="is-reveal__frame">
          <RoomCutaway look={roomLook(run, BARE)} title="Before" className="is-reveal__room" />
          <div className="is-reveal__after" style={{ clipPath: `inset(0 ${100 - share}% 0 0)` }}>
            <RoomCutaway look={roomLook(run, FINISHED)} title="After" className="is-reveal__room" />
          </div>
          <span className="is-reveal__tag is-reveal__tag--before">Before</span>
          <span className="is-reveal__tag is-reveal__tag--after" style={{ opacity: share > 10 ? 1 : 0 }}>
            After
          </span>
        </div>
        <div
          ref={trackRef}
          className="is-reveal__track"
          onPointerDown={(event) => {
            if (event.button !== 0 || event.target !== event.currentTarget) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            fromPointer(event);
          }}
          onPointerMove={(event) => {
            if (dragging && event.target === event.currentTarget) fromPointer(event);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <div
            className={dragging ? "is-reveal__handle is-reveal__handle--dragging" : "is-reveal__handle"}
            style={{ left: `${share}%` }}
            role="slider"
            tabIndex={0}
            aria-label="Reveal slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(share)}
            data-testid="reveal-handle"
            onKeyDown={keys}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(true);
            }}
            onPointerMove={(event) => {
              if (dragging) fromPointer(event);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <span aria-hidden="true">⇆</span>
          </div>
        </div>
        <p className="is-reveal__hint" role="status">
          {check.ok
            ? ready
              ? "Ta-da! Open their eyes."
              : "Drag the handle all the way across."
            : check.reasons[0]}
        </p>
        <Button
          size="lg"
          icon="sparkle"
          disabledReason={ready ? undefined : check.ok ? "Slide the reveal across first." : check.reasons[0]}
          onClick={(event) => once(event, { type: "reveal" })}
          data-testid="reveal-button"
        >
          Open your eyes!
        </Button>
      </div>
    </div>
  );
}
