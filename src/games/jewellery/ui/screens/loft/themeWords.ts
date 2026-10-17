import { LAUNCH_MUSIC_WORDS } from "../../../content/launchMusic";
import type { LaunchThemeDef } from "../../../content/launchTheme";
import { backdropById, lanternById } from "../../../core";

export function themeWords(theme: LaunchThemeDef): readonly string[] {
  return [
    LAUNCH_MUSIC_WORDS[theme.music],
    lanternById(theme.lantern).word,
    backdropById(theme.backdrop).word,
  ];
}
