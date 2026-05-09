type Rgb = {
  r: number;
  g: number;
  b: number;
};

function clampByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function parseHexColor(input: string): Rgb | null {
  const raw = input.trim().replace(/^#/, "");

  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }

  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }

  return null;
}

function parseRgbColor(input: string): { rgb: Rgb; a: number } | null {
  const m = input
    .trim()
    .match(/^rgba?\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*(?:,\s*([+-]?\d*\.?\d+)\s*)?\)$/i);

  if (!m) return null;

  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const a = m[4] === undefined ? 1 : Number(m[4]);

  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;

  return {
    rgb: { r: clampByte(r), g: clampByte(g), b: clampByte(b) },
    a: Math.min(1, Math.max(0, a)),
  };
}

function relativeLuminance({ r, g, b }: Rgb) {
  const srgb = [r, g, b].map((v) => v / 255);
  const linear = srgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: Rgb, b: Rgb) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [light, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

function blendOverWhite(rgb: Rgb, alpha: number): Rgb {
  return {
    r: clampByte(255 * (1 - alpha) + rgb.r * alpha),
    g: clampByte(255 * (1 - alpha) + rgb.g * alpha),
    b: clampByte(255 * (1 - alpha) + rgb.b * alpha),
  };
}

export function pickReadableTextColor(
  background: string,
  options?: { lightText?: string; darkText?: string; fallback?: string },
) {
  const lightText = options?.lightText ?? "#ffffff";
  const darkText = options?.darkText ?? "#111827";
  const fallback = options?.fallback ?? lightText;

  const bgHex = background.trim().startsWith("#") ? parseHexColor(background) : null;
  const rgbParsed = bgHex ? null : parseRgbColor(background);

  const bg = bgHex
    ? bgHex
    : rgbParsed
      ? blendOverWhite(rgbParsed.rgb, rgbParsed.a)
      : null;

  if (!bg) return fallback;

  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 0, g: 0, b: 0 };

  const contrastWithWhite = contrastRatio(bg, white);
  const contrastWithBlack = contrastRatio(bg, black);

  return contrastWithBlack >= contrastWithWhite ? darkText : lightText;
}

