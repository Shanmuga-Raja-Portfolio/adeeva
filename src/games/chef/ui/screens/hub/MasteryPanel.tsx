import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CLEAN_PASS_STREAK } from "../../../content/award";
import { CAREER } from "../../../content/career";
import { CUISINES } from "../../../content/cuisine";
import { masteryLevel, mentorFor, type GameState } from "../../../core";
import { chefWhites } from "../../art/chefWhites";

const LEVEL_NAMES = { learner: "Learner", confident: "Confident", expert: "Expert" } as const;

export function MasteryPanel({ state }: { readonly state: GameState }) {
  return (
    <section className="ck-panel ck-mastery" aria-labelledby="ck-mastery-title">
      <header className="ck-panel__header">
        <h2 id="ck-mastery-title">Six kitchens</h2>
        <span className="ck-muted">
          {state.mentorsMet.length} of 6 mentors met · {state.awards.length} awards
        </span>
      </header>
      <ul className="ck-mastery__list">
        {CUISINES.map((cuisine) => {
          const points = state.mastery[cuisine.id];
          const level = masteryLevel(points);
          const mentor = mentorFor(cuisine.id);
          const pinned = state.awards.includes(`mentor-pin-${cuisine.id}`);
          return (
            <li
              key={cuisine.id}
              className="ck-mastery__row"
              style={{ ["--ck-cuisine" as string]: cuisine.accent }}
            >
              <Avatar
                look={mentor.look}
                garment={chefWhites(cuisine.accent)}
                size={40}
                title={mentor.name}
                frameColour={cuisine.wall}
              />
              <div className="ck-mastery__body">
                <span className="ck-mastery__name">
                  {cuisine.name}
                  {pinned ? (
                    <span className="ck-mastery__pin" title="Mentor's Pin">
                      <Icon name="star" size={14} />
                    </span>
                  ) : null}
                  {state.mentorsMet.includes(cuisine.id) ? null : (
                    <span className="ck-mastery__new">not met yet</span>
                  )}
                </span>
                <span
                  className="ck-mastery__track"
                  role="meter"
                  aria-label={`${cuisine.name} mastery`}
                  aria-valuemin={0}
                  aria-valuemax={CAREER.expertMastery}
                  aria-valuenow={Math.min(points, CAREER.expertMastery)}
                >
                  <span
                    className="ck-mastery__fill"
                    style={{
                      width: `${(Math.min(points, CAREER.expertMastery) / CAREER.expertMastery) * 100}%`,
                    }}
                  />
                  <span
                    className="ck-mastery__mark"
                    style={{ left: `${(CAREER.confidentMastery / CAREER.expertMastery) * 100}%` }}
                  />
                </span>
              </div>
              <span className={`ck-mastery__level ck-mastery__level--${level}`}>{LEVEL_NAMES[level]}</span>
            </li>
          );
        })}
      </ul>
      {state.awards.includes("clean-pass") ? (
        <p className="ck-mastery__award">
          <Icon name="star" size={16} /> Clean Pass Award: five spotless services in a row!
        </p>
      ) : (
        <p className="ck-muted ck-mastery__hint">
          Clean pass streak: {state.cleanStreak} of {CLEAN_PASS_STREAK} services with every dish at 4 stars.
        </p>
      )}
    </section>
  );
}
