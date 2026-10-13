import type { CSSProperties } from "react";
import type { ShowThemeDef } from "../../../content/showTheme";
import { darken, lighten, luminance, mixHex } from "../../../../../ui/art/colourMix";
import { colourById } from "../../../core";

function saturation(hex: string): number {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255);
  const high = Math.max(...channels);
  const low = Math.min(...channels);
  return high === 0 ? 0 : (high - low) / high;
}

function vividness(hex: string): number {
  const light = luminance(hex);
  const balance = light < 0.08 ? 0.3 : light > 0.62 ? 0.5 : 1;
  return saturation(hex) * balance;
}

export interface ThemeAccent {
  readonly accent: string;
  readonly second: string;
  readonly third: string;
  readonly night: string;
  readonly glow: string;
  readonly heart: string;
}

export function themeAccent(theme: ShowThemeDef): ThemeAccent {
  const hexes = theme.palette.map((colour) => colourById(colour).hex);
  const ranked = [...hexes].sort((a, b) => vividness(b) - vividness(a));
  const accent = ranked[0] ?? "#d0587e";
  const second = ranked[1] ?? "#7fa58a";
  const third = ranked[2] ?? "#c9a227";
  const deep = hexes.filter((hex) => saturation(hex) >= 0.3).sort((a, b) => luminance(a) - luminance(b))[0];
  return {
    accent: luminance(accent) > 0.45 ? darken(accent, 0.25) : accent,
    second,
    third,
    night: mixHex(deep ?? "#2b2230", "#0b0910", 0.68),
    glow: lighten(accent, 0.35),
    heart: mixHex("#ff6f9a", accent, 0.25),
  };
}

export function themeAccentStyle(theme: ShowThemeDef): CSSProperties {
  const accent = themeAccent(theme);
  return {
    "--label-accent": accent.accent,
    "--label-accent-2": accent.second,
    "--label-accent-3": accent.third,
    "--label-night": accent.night,
    "--label-glow": accent.glow,
    "--label-heart": accent.heart,
  } as CSSProperties;
}
