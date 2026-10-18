import { isGameId, type GameId } from "./gameModule";

export type StudioRoute =
  | { readonly name: "home" }
  | { readonly name: "parent" }
  | { readonly name: "about" }
  | { readonly name: "game"; readonly gameId: GameId };

export const HOME_ROUTE: StudioRoute = { name: "home" };

function routePath(hash: string): string {
  const path = hash.replace(/^#\/?/, "");
  let end = path.length;
  while (end > 0 && path.charAt(end - 1) === "/") end -= 1;
  return path.slice(0, end);
}

export function parseRoute(hash: string, isOpen: (gameId: GameId) => boolean): StudioRoute {
  const path = routePath(hash);
  if (path === "parent") return { name: "parent" };
  if (path === "about") return { name: "about" };
  if (isGameId(path) && isOpen(path)) return { name: "game", gameId: path };
  return HOME_ROUTE;
}

export function routeHash(route: StudioRoute): string {
  if (route.name === "parent") return "#/parent";
  if (route.name === "about") return "#/about";
  if (route.name === "game") return `#/${route.gameId}`;
  return "#/";
}
