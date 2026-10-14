import { failed, isPlainObject, type Parser } from "../../../engine/parse";

export function taggedParser<T>(cases: Readonly<Record<string, Parser<T>>>): Parser<T> {
  const kinds = Object.keys(cases);
  return (input, path) => {
    if (!isPlainObject(input)) return failed(path, "an object");
    const kind = input.kind;
    const parse = typeof kind === "string" && Object.hasOwn(cases, kind) ? cases[kind] : undefined;
    return parse === undefined ? failed(`${path}.kind`, `one of ${kinds.join(", ")}`) : parse(input, path);
  };
}
