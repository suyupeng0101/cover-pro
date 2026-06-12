import type { Theme } from '../types';

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Hsl = {
  h: number;
  s: number;
  l: number;
};

export function createCustomTheme(accentHex: string, backgroundHex: string): Theme {
  const accent = normalizeHex(accentHex);
  const background = normalizeHex(backgroundHex);
  const hsl = rgbToHsl(hexToRgb(accent));
  const backgroundHsl = rgbToHsl(hexToRgb(background));
  const isLightBackground = backgroundHsl.l > 58;
  const accent2 = hslToHex({
    h: (hsl.h + 42) % 360,
    s: clamp(hsl.s + 8, 58, 95),
    l: clamp(hsl.l + 7, 48, 72),
  });

  const foreground = isLightBackground
    ? hslToHex({
        h: backgroundHsl.h,
        s: clamp(backgroundHsl.s + 8, 24, 58),
        l: 10,
      })
    : hslToHex({
        h: hsl.h,
        s: clamp(hsl.s, 28, 62),
        l: 93,
      });

  const muted = isLightBackground
    ? hslToHex({
        h: backgroundHsl.h,
        s: clamp(backgroundHsl.s + 4, 16, 42),
        l: 34,
      })
    : hslToHex({
        h: hsl.h,
        s: clamp(hsl.s - 12, 18, 42),
        l: 67,
      });

  return {
    id: 'custom-theme',
    name: 'Custom',
    accent,
    accent2,
    background,
    foreground,
    muted,
  };
}

function normalizeHex(hex: string) {
  const value = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
  }
  return '#00E5FF';
}

function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    if (max === bn) h = 60 * ((rn - gn) / delta + 4);
  }

  return {
    h: h < 0 ? h + 360 : h,
    s: s * 100,
    l: l * 100,
  };
}

function hslToHex({ h, s, l }: Hsl) {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];

  const toHex = (value: number) => {
    return Math.round((value + m) * 255).toString(16).padStart(2, '0');
  };

  return `#${toHex(rn)}${toHex(gn)}${toHex(bn)}`.toUpperCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
