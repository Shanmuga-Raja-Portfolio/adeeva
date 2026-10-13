export type ParseResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };
export type Parser<T> = (input: unknown, path: string) => ParseResult<T>;

export function parsed<T>(value: T): ParseResult<T> {
  return { ok: true, value };
}

export function failed<T>(path: string, expectation: string): ParseResult<T> {
  return { ok: false, error: `${path}: expected ${expectation}` };
}

export function isPlainObject(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

export const numberParser: Parser<number> = (input, path) =>
  typeof input === "number" && Number.isFinite(input) ? parsed(input) : failed(path, "a finite number");

export const integerParser: Parser<number> = (input, path) =>
  typeof input === "number" && Number.isInteger(input) ? parsed(input) : failed(path, "a whole number");

export const stringParser: Parser<string> = (input, path) =>
  typeof input === "string" ? parsed(input) : failed(path, "text");

export const booleanParser: Parser<boolean> = (input, path) =>
  typeof input === "boolean" ? parsed(input) : failed(path, "true or false");

export function refined<T>(parser: Parser<T>, check: (value: T) => boolean, expectation: string): Parser<T> {
  return (input, path) => {
    const outcome = parser(input, path);
    if (!outcome.ok) return outcome;
    return check(outcome.value) ? outcome : failed(path, expectation);
  };
}

export function rangeParser(min: number, max: number): Parser<number> {
  return refined(numberParser, (value) => value >= min && value <= max, `a number from ${min} to ${max}`);
}

export function integerRangeParser(min: number, max: number): Parser<number> {
  return refined(
    integerParser,
    (value) => value >= min && value <= max,
    `a whole number from ${min} to ${max}`,
  );
}

export function oneOf<const T extends string | number>(options: readonly T[]): Parser<T> {
  return (input, path) => {
    const match = options.find((option) => option === input);
    return match === undefined ? failed(path, `one of ${options.join(", ")}`) : parsed(match);
  };
}

export function nullable<T>(parser: Parser<T>): Parser<T | null> {
  return (input, path) => (input === null ? parsed(null) : parser(input, path));
}

export function arrayOf<T>(item: Parser<T>): Parser<readonly T[]> {
  return (input, path) => {
    if (!Array.isArray(input)) return failed(path, "a list");
    const values: T[] = [];
    for (const [index, entry] of input.entries()) {
      const outcome = item(entry, `${path}[${index}]`);
      if (!outcome.ok) return outcome;
      values.push(outcome.value);
    }
    return parsed(values);
  };
}

export function objectOf<T>(shape: { readonly [K in keyof T]-?: Parser<T[K]> }): Parser<T> {
  return (input, path) => {
    if (!isPlainObject(input)) return failed(path, "an object");
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(shape) as (keyof T & string)[]) {
      const parse: Parser<unknown> = shape[key];
      const outcome = parse(input[key], `${path}.${key}`);
      if (!outcome.ok) return outcome;
      result[key] = outcome.value;
    }
    return parsed(result as T);
  };
}

export function recordOf<T>(
  isKey: (key: string) => boolean,
  value: Parser<T>,
): Parser<Readonly<Record<string, T>>> {
  return (input, path) => {
    if (!isPlainObject(input)) return failed(path, "an object");
    const entries: [string, T][] = [];
    for (const [key, entry] of Object.entries(input)) {
      if (!isKey(key)) return failed(`${path}.${key}`, "a known key");
      const outcome = value(entry, `${path}.${key}`);
      if (!outcome.ok) return outcome;
      entries.push([key, outcome.value]);
    }
    return parsed(Object.fromEntries(entries));
  };
}

export function fixedRecordOf<K extends string, T>(
  keys: readonly K[],
  value: Parser<T>,
): Parser<Readonly<Record<K, T>>> {
  return (input, path) => {
    if (!isPlainObject(input)) return failed(path, "an object");
    const entries: [K, T][] = [];
    for (const key of keys) {
      const outcome = value(input[key], `${path}.${key}`);
      if (!outcome.ok) return outcome;
      entries.push([key, outcome.value]);
    }
    return parsed(Object.fromEntries(entries) as Record<K, T>);
  };
}
