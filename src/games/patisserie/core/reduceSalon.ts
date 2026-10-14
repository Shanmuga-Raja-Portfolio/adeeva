import type { SalonAction } from "./action";
import { chooseSplit } from "./design";
import type { GameState } from "./gameState";
import { openSalon } from "./openSalon";
import { restParlour } from "./parlour";
import { setSalonMenu } from "./salonMenu";
import { startSalonTray } from "./salonTray";
import { plateItem, unplateItem } from "./standPlating";
import { serveTable } from "./tablePay";
import { finishSalonDay, openTables } from "./tableSession";
import { pourTea } from "./teaPour";

export function reduceSalon(state: GameState, action: SalonAction): GameState {
  switch (action.type) {
    case "openSalon":
      return openSalon(state);
    case "restParlour":
      return restParlour(state);
    case "setSalonMenu":
      return setSalonMenu(state, action.menu);
    case "startSalonTray":
      return startSalonTray(state, action.tier);
    case "chooseSplit":
      return chooseSplit(state, action.split);
    case "openTables":
      return openTables(state);
    case "closeTables":
      return (state.salon?.session ?? null) === null ? state : finishSalonDay(state);
    case "plateItem":
      return plateItem(state, action.tableIndex, action.tier, action.colour);
    case "unplateItem":
      return unplateItem(state, action.tableIndex, action.tier);
    case "pourTea":
      return pourTea(state, action.tableIndex, {
        ml: action.ml,
        actions: action.actions,
        assisted: action.assisted,
      });
    case "serveTable":
      return serveTable(state, action.tableIndex);
  }
}
