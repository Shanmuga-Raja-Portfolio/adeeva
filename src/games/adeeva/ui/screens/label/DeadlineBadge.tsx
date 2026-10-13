export interface DeadlineBadgeProps {
  day: number;
  startDay: number;
  deadlineDay: number;
  complete: boolean;
}

export function DeadlineBadge({ day, startDay, deadlineDay, complete }: DeadlineBadgeProps) {
  const daysLeft = deadlineDay - day;
  const span = Math.max(1, deadlineDay - startDay + 1);
  const remaining = complete ? 0 : Math.min(1, Math.max(0, (daysLeft + 1) / span));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const headline = complete ? "✓" : daysLeft > 0 ? String(daysLeft) : daysLeft === 0 ? "Today" : "Late";
  const caption = complete
    ? "Show complete"
    : daysLeft > 1
      ? "days to the show"
      : daysLeft === 1
        ? "day to the show"
        : daysLeft === 0
          ? "is show day"
          : `due day ${deadlineDay}`;
  return (
    <div
      className={daysLeft < 0 && !complete ? "ad-deadline ad-deadline--late" : "ad-deadline"}
      data-testid="season-deadline"
    >
      <svg viewBox="0 0 80 80" className="ad-deadline__ring" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} className="ad-deadline__track" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="ad-deadline__fill"
          strokeDasharray={`${circumference * remaining} ${circumference}`}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <span
        className={headline.length > 2 ? "ad-deadline__count ad-deadline__count--word" : "ad-deadline__count"}
      >
        {headline}
      </span>
      <span className="ad-deadline__caption">
        {caption}
        <small>Show on day {deadlineDay}</small>
      </span>
    </div>
  );
}
