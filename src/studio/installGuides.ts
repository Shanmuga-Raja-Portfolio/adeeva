import type { InstallScene } from "./installPictures";

export type InstallDevice = "android" | "chromebook" | "windows" | "apple-mobile" | "mac";

export interface InstallStep {
  readonly scene: InstallScene;
  readonly text: string;
}

export interface InstallGuide {
  readonly device: InstallDevice;
  readonly title: string;
  readonly intro: string;
  readonly steps: readonly InstallStep[];
}

export const INSTALL_GUIDES: readonly InstallGuide[] = [
  {
    device: "android",
    title: "Android phone or handheld",
    intro: "Use Chrome.",
    steps: [
      { scene: "android-menu", text: "Open the studio link in Chrome, then tap the menu with three dots." },
      { scene: "android-install", text: "Tap Install app. Some phones call it Add to Home screen." },
      {
        scene: "phone-home",
        text: "Open Maker Studio from its new icon. It works without the internet now.",
      },
    ],
  },
  {
    device: "chromebook",
    title: "Chromebook",
    intro: "Use Chrome.",
    steps: [
      {
        scene: "address-install",
        text: "Open the studio link, then select the install icon at the end of the address bar.",
      },
      { scene: "install-dialog", text: "Choose Install." },
      { scene: "desktop-app", text: "Maker Studio now sits in the launcher and opens in its own window." },
    ],
  },
  {
    device: "windows",
    title: "Windows PC",
    intro: "Use Chrome or Microsoft Edge.",
    steps: [
      {
        scene: "address-install",
        text: "Open the studio link, then select the install icon in the address bar. In Edge it can also be under the ··· menu, then Apps.",
      },
      { scene: "install-dialog", text: "Choose Install." },
      { scene: "desktop-app", text: "Open it from the Start menu, or pin it to the taskbar." },
    ],
  },
  {
    device: "apple-mobile",
    title: "iPhone or iPad",
    intro: "Use Safari. Apple doesn't show an install button, so it takes three taps.",
    steps: [
      {
        scene: "safari-share",
        text: "Open the studio link in Safari and tap Share, the square with an arrow. On iPad it is at the top.",
      },
      { scene: "share-sheet", text: "Scroll down the list and tap Add to Home Screen." },
      { scene: "share-add", text: "Tap Add. From now on, always play from the new home-screen icon." },
    ],
  },
  {
    device: "mac",
    title: "Mac",
    intro: "Use Safari on macOS Sonoma or later, or the install icon in Chrome or Edge.",
    steps: [
      { scene: "mac-file-menu", text: "Open the studio link in Safari, then choose File, then Add to Dock." },
      { scene: "add-dialog", text: "Choose Add." },
      { scene: "mac-dock", text: "Open Maker Studio from the Dock, like any other app." },
    ],
  },
];

export function likelyDevice(userAgent: string, touchPoints: number): InstallDevice | null {
  if (/Android/i.test(userAgent)) return "android";
  if (/CrOS/.test(userAgent)) return "chromebook";
  if (/iPhone|iPad|iPod/.test(userAgent)) return "apple-mobile";
  if (/Macintosh/.test(userAgent)) return touchPoints > 1 ? "apple-mobile" : "mac";
  if (/Windows/.test(userAgent)) return "windows";
  return null;
}
