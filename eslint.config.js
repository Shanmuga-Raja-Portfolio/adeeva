import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

const GAME_IDS = ["adeeva", "thrift-flip", "patisserie", "workshop", "interior", "jewellery", "chef"];
const ALLOWED_GAME_IMPORTS = { "thrift-flip": ["adeeva"] };
const PURE_GLOBALS = [
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "Date",
  "performance",
  "crypto",
  "globalThis",
  "self",
];
const RANDOM_SYNTAX = {
  selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
  message: "Use the seeded RNG in core.",
};
const DYNAMIC_IMPORT_SYNTAX = {
  selector: "ImportExpression",
  message: "Pure code loads nothing at runtime.",
};
const FIXED_IMPORT_SYNTAX = {
  selector: "ImportExpression[source.type!='Literal']",
  message: "Load a module only by a fixed path.",
};

function folderSource(folders) {
  return `^([.]{1,2}/)*[.][.]/(.*/)?(${folders.join("|")})(/|$)`;
}

function folderPatterns(folders) {
  return folders.length === 0 ? [] : [{ regex: folderSource(folders) }];
}

function importSyntax(source, message) {
  return { selector: `ImportExpression > Literal[value=/${source.replaceAll("/", "\\x2F")}/]`, message };
}

function otherGameSyntax(gameId) {
  const others = otherGames(gameId);
  return others.length === 0 ? [] : [importSyntax(folderSource(others), "Games stay in their own folder.")];
}

function otherGames(gameId) {
  const allowed = ALLOWED_GAME_IMPORTS[gameId] ?? [];
  return GAME_IDS.filter((other) => other !== gameId && !allowed.includes(other));
}

const PURE_IMPORTS = [{ regex: "^react(-dom)?(/|$)" }, ...folderPatterns(["ui", "studio", "app"])];
const GAME_INTERNALS_SOURCE = "^([.]{1,2}/)*[.][.]/(.*/)?games/[^/]+/(?!module$)";
const GAME_INTERNALS_MESSAGE = "The studio reaches a game only through its module.";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "test-results*", "playwright-report"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-syntax": ["error", RANDOM_SYNTAX],
    },
  },
  {
    files: ["src/engine/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [...PURE_IMPORTS, ...folderPatterns(["games"])] }],
      "no-restricted-globals": ["error", ...PURE_GLOBALS],
      "no-restricted-syntax": ["error", RANDOM_SYNTAX, DYNAMIC_IMPORT_SYNTAX],
    },
  },
  {
    files: ["src/studio/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ regex: GAME_INTERNALS_SOURCE, message: GAME_INTERNALS_MESSAGE }] },
      ],
      "no-restricted-syntax": [
        "error",
        RANDOM_SYNTAX,
        importSyntax(GAME_INTERNALS_SOURCE, GAME_INTERNALS_MESSAGE),
      ],
    },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", { patterns: folderPatterns(["games", "studio"]) }] },
  },
  ...GAME_IDS.flatMap((gameId) => [
    {
      files: [`src/games/${gameId}/**/*.{ts,tsx}`],
      rules: {
        "no-restricted-imports": ["error", { patterns: folderPatterns(otherGames(gameId)) }],
        "no-restricted-syntax": ["error", RANDOM_SYNTAX, FIXED_IMPORT_SYNTAX, ...otherGameSyntax(gameId)],
      },
    },
    {
      files: [`src/games/${gameId}/core/**/*.{ts,tsx}`, `src/games/${gameId}/content/**/*.{ts,tsx}`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...PURE_IMPORTS, ...folderPatterns(otherGames(gameId))] },
        ],
        "no-restricted-globals": ["error", ...PURE_GLOBALS],
        "no-restricted-syntax": ["error", RANDOM_SYNTAX, DYNAMIC_IMPORT_SYNTAX],
      },
    },
  ]),
);
