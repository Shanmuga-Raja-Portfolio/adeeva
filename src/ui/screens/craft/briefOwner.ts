import type { ClientDef } from "../../../content/client";
import type { ShowThemeDef } from "../../../content/showTheme";
import { clientById, themeById, type Brief } from "../../../core";

export interface BriefOwner {
  readonly client: ClientDef | undefined;
  readonly theme: ShowThemeDef | undefined;
}

export function briefOwner(brief: Brief): BriefOwner {
  return {
    client: brief.clientId === null ? undefined : clientById(brief.clientId),
    theme: brief.themeId === null ? undefined : themeById(brief.themeId),
  };
}
