import { dishById, dishFinished, onRail, type ServiceRun } from "../../../core";
import { formatClock, printerCount } from "./serviceView";

export interface TicketRailProps {
  readonly service: ServiceRun;
  readonly now: number;
  readonly clocked: boolean;
}

export function TicketRail({ service, now, clocked }: TicketRailProps) {
  const tickets = service.tickets.filter(onRail);
  const waiting = printerCount(service);
  const sent = service.tickets.filter((ticket) => ticket.sentAt !== null).length;
  return (
    <section className="ck-ticket-rail" aria-label="Ticket rail" data-testid="ticket-rail">
      <div className="ck-ticket-rail__bar" aria-hidden="true" />
      <div className="ck-ticket-rail__slips">
        {tickets.length === 0 ? (
          <p className="ck-ticket-rail__empty">No tickets on the rail right now.</p>
        ) : null}
        {tickets.map((ticket, index) => {
          const age = ticket.railAt === null ? 0 : now - ticket.railAt;
          const share = clocked ? Math.min(1, age / service.plan.targetSeconds) : 0;
          return (
            <article
              key={ticket.id}
              className={ticket.id === service.spotlight ? "ck-slip ck-slip--critic" : "ck-slip"}
              style={{ ["--ck-tilt" as string]: `${index % 2 === 0 ? -2 : 2}deg` }}
              data-testid={`slip-${ticket.id}`}
            >
              <header className="ck-slip__head">
                <strong>Table {ticket.table}</strong>
                {ticket.id === service.spotlight ? (
                  <span className="ck-slip__critic" title="A quiet guest with a notebook">
                    Notebook
                  </span>
                ) : null}
                {clocked ? <span className="ck-slip__time">{formatClock(age)}</span> : null}
              </header>
              <ul className="ck-slip__dishes">
                {ticket.dishes.map((dish, dishIndex) => {
                  const def = dishById(dish.dishId);
                  const done = dish.steps.filter((step) => step !== null).length;
                  return (
                    <li
                      key={dishIndex}
                      className={dishFinished(dish) ? "ck-slip__dish ck-slip__dish--done" : "ck-slip__dish"}
                    >
                      <span>{def.name}</span>
                      <span className="ck-slip__dots" aria-label={`${done} of ${dish.steps.length} steps`}>
                        {dish.steps.map((step, stepIndex) => (
                          <span
                            key={stepIndex}
                            className={
                              step === null ? "ck-slip__dot" : `ck-slip__dot ck-slip__dot--${step.by}`
                            }
                          />
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {clocked ? (
                <span className="ck-slip__ribbon" aria-hidden="true">
                  <span className="ck-slip__ribbon-fill" style={{ width: `${share * 100}%` }} />
                </span>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="ck-ticket-rail__status">
        <span>{waiting} in the printer</span>
        <span>
          {sent} of {service.tickets.length} sent
        </span>
      </div>
    </section>
  );
}
