export const SHOW_PANEL_IDS = ["craft-circle", "green-thread", "story-table"] as const;
export type ShowPanelId = (typeof SHOW_PANEL_IDS)[number];

export interface ShowPanelDef {
  readonly id: ShowPanelId;
  readonly name: string;
  readonly who: string;
  readonly praise: string;
}

export const SHOW_PANELS: readonly ShowPanelDef[] = [
  {
    id: "craft-circle",
    name: "Craft Circle",
    who: "The Larkspur menders' group",
    praise: "The menders loved your neat, careful work.",
  },
  {
    id: "green-thread",
    name: "Green Thread",
    who: "The repair café volunteers",
    praise: "The repair café cheered every rescued scrap.",
  },
  {
    id: "story-table",
    name: "Story Table",
    who: "The library story circle",
    praise: "The story circle followed every piece's tale.",
  },
];
