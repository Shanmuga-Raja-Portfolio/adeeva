import { useState } from "react";
import { Button } from "../ui/kit/Button";
import { Icon } from "../ui/kit/IconSet";
import { ForgetDeviceDialog } from "./ForgetDeviceDialog";
import { InstallGuideCard } from "./InstallGuideCard";
import { INSTALL_GUIDES, likelyDevice } from "./installGuides";
import { SignedOutMark } from "./SignedOutMark";
import "./parent.css";
import "./about.css";

const NEVER = [
  "No ads, and nothing to buy.",
  "No chat and no contact with other players.",
  "No accounts or sign-ins inside the game. The only name it knows is the maker name your child types.",
  "No analytics, tracking or advertising cookies.",
  "Nothing from other companies: no outside scripts, fonts, images or videos.",
  "No network requests once it has loaded. When you are online it only asks its own address whether a newer version exists and whether your family sign-in is still open.",
] as const;

function clearStorage(): void {
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    return;
  }
}

function forgetThisDevice(): void {
  clearStorage();
  window.location.hash = "#/";
  window.location.reload();
}

export function AboutPage() {
  const [device] = useState(() => likelyDevice(navigator.userAgent, navigator.maxTouchPoints));
  const [forgetting, setForgetting] = useState(false);

  return (
    <main className="st-parent st-about ad-screen" data-testid="about-page">
      <header className="st-parent__head">
        <div className="st-parent__top">
          <a className="st-parent__back" href="#/">
            <Icon name="back" size={20} />
            Back to the studio
          </a>
          <SignedOutMark />
        </div>
        <span className="st-eyebrow">For families</span>
        <h1>About Maker Studio and your privacy</h1>
        <p className="st-muted">
          Maker Studio is a set of calm making games that run inside the browser, on your device. Here is what
          it keeps, what it never does, and how to install it like an app.
        </p>
      </header>

      <section className="st-parent__card" aria-labelledby="st-keeps-title">
        <h2 id="st-keeps-title">
          <Icon name="lock" size={22} />
          What it keeps, and where
        </h2>
        <p>
          Saves, settings, the maker name and look your child picks, and time played. All of it lives only in
          this browser&apos;s storage on this device. Nothing is uploaded and there is no account to sync it
          to.
        </p>
        <p className="st-muted">
          The studio asks the browser to keep this storage safe, so it isn&apos;t cleared when the device runs
          low on space. If the browser says no, nothing changes for you.
        </p>
      </section>

      <section className="st-parent__card st-parent__card--promise" aria-labelledby="st-never-title">
        <h2 id="st-never-title">
          <Icon name="shield" size={22} />
          What it never does
        </h2>
        <ul className="st-parent__promises">
          {NEVER.map((promise) => (
            <li key={promise}>
              <Icon name="check" size={18} />
              {promise}
            </li>
          ))}
        </ul>
      </section>

      <section className="st-parent__card" aria-labelledby="st-host-title">
        <h2 id="st-host-title">
          <Icon name="home" size={22} />
          Where it lives online
        </h2>
        <p>
          The studio is a set of plain files on a web host. Like every website host, it keeps standard request
          logs, such as a device&apos;s internet address and the time a file was fetched. The game adds
          nothing to them.
        </p>
        <p className="st-muted">
          If your invitation asked you to sign in with an emailed code, the host runs that sign-in to keep the
          studio private to invited families. The game itself never sees your email address. When that sign-in
          runs out, the studio still opens with your games and saves, shows a small Signed out note, and waits
          for you to sign in before it fetches a new version.
        </p>
      </section>

      <section className="st-parent__card" aria-labelledby="st-install-title">
        <h2 id="st-install-title">
          <Icon name="plus" size={22} />
          Install it like an app
        </h2>
        <p>
          Installing puts Maker Studio on the home screen or in the app list. It opens in its own window and
          plays without the internet. Pick your device:
        </p>
        <div className="st-about__guides">
          {INSTALL_GUIDES.map((guide) => (
            <InstallGuideCard key={guide.device} guide={guide} open={guide.device === device} />
          ))}
        </div>
      </section>

      <section className="st-parent__card" aria-labelledby="st-devices-title">
        <h2 id="st-devices-title">
          <Icon name="board" size={22} />
          Saves stay on each device
        </h2>
        <ul className="st-about__points">
          <li>Each device, and each browser on it, keeps its own saves. They never move between devices.</li>
          <li>
            On iPhone and iPad, the home-screen app keeps its saves apart from Safari tabs. Saves made in a
            Safari tab won&apos;t appear in the app, so play from the icon.
          </li>
          <li>
            When a new version is ready, the studio says so on its home screen and waits for you to choose
            Restart. It never restarts in the middle of a game, and saves carry over.
          </li>
        </ul>
      </section>

      <section className="st-parent__card" aria-labelledby="st-delete-title">
        <h2 id="st-delete-title">
          <Icon name="close" size={22} />
          Deleting everything
        </h2>
        <ul className="st-about__points">
          <li>
            To delete one game&apos;s saves, use the <a href="#/parent">Parent page</a>.
          </li>
          <li>
            Uninstalling deletes the saves on iPhone and iPad. In Chrome and Edge, tick Also clear data when
            you uninstall, or clear this site&apos;s data in the browser settings.
          </li>
          <li>The button below deletes every save, setting and playtime record on this device right now.</li>
        </ul>
        <Button variant="secondary" onClick={() => setForgetting(true)}>
          Delete everything on this device
        </Button>
      </section>

      <ForgetDeviceDialog open={forgetting} onKeep={() => setForgetting(false)} onForget={forgetThisDevice} />
    </main>
  );
}
