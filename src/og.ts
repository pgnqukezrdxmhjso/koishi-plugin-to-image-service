import { EmojiType, getIconCode, loadEmoji } from "./emoji";
import { FontDetector, languageFontMap } from "./language";
import type Satori from "satori";
import type { SatoriOptions } from "satori";
import type { ReactElement } from "react";

export type SvgOptions = {
  /**
   * The width of the image.
   *
   * @type {number}
   */
  width?: number;
  /**
   * The height of the image.
   *
   * @type {number}
   */
  height?: number;
  /**
   * Display debug information on the image.
   *
   * @type {boolean}
   * @default false
   */
  debug?: boolean;
  /**
   * A list of fonts to use.
   *
   * @type {{ data: ArrayBuffer; name: string; weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style?: 'normal' | 'italic' }[]}
   * @default Noto Sans Latin Regular.
   */
  fonts?: SatoriOptions["fonts"];
  /**
   * Using a specific Emoji style. Defaults to `twemoji`.
   *
   * @type {EmojiType}
   * @default 'twemoji'
   */
  emoji?: EmojiType;
};

export type Font = SvgOptions["fonts"][number];
export type Logger = (msg: string) => void;

async function loadGoogleFont(font: string, text: string) {
  if (!font || !text) return;

  const API = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text,
  )}`;

  const css = await (
    await fetch(API, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );
  if (!resource) throw new Error("Failed to download dynamic font");

  const res = await fetch(resource[1]);
  if (!res.ok) {
    throw new Error("Failed to download dynamic font. Status: " + res.status);
  }

  return res.arrayBuffer();
}

const detector = new FontDetector();

const assetCache = new Map<string, any>();
const loadDynamicAsset = ({ emoji }: { emoji?: EmojiType }) => {
  const fn = async (code, text) => {
    if (code === "emoji") {
      // It's an emoji, load the image.
      return (
        `data:image/svg+xml;base64,` +
        btoa(await (await loadEmoji(getIconCode(text), emoji)).text())
      );
    }

    const codes = code.split("|");

    // Try to load from Google Fonts.
    const names = codes
      .map((code) => languageFontMap[code as keyof typeof languageFontMap])
      .filter(Boolean)
      .flat();

    if (names.length === 0) return [];

    try {
      const textByFont = await detector.detect(text, names);
      const fonts = Object.keys(textByFont);

      const fontData = await Promise.all(
        fonts.map((font) => loadGoogleFont(font, textByFont[font])),
      );
      return fontData.map((data, index) => ({
        name: `satori_${codes[index]}_fallback_${text}`,
        data,
        weight: 400,
        style: "normal",
        lang: codes[index] === "unknown" ? undefined : codes[index],
      }));
    } catch (e) {
      console.error("Failed to load dynamic font for", text, ". Error:", e);
    }
  };

  return async (...args: Parameters<typeof fn>) => {
    const key = emoji + "-" + JSON.stringify(args);
    const cache = assetCache.get(key);
    if (cache) return cache;

    const asset = await fn(...args);
    assetCache.set(key, asset);
    return asset;
  };
};

export async function renderSvg(
  satori: typeof Satori,
  options: SvgOptions,
  defaultFonts: Font[],
  element: ReactElement<any, any>,
) {
  return await satori(element, {
    width: options.width,
    height: options.height,
    debug: options.debug,
    fonts: options.fonts || defaultFonts,
    loadAdditionalAsset: loadDynamicAsset({
      emoji: options.emoji,
    }),
  });
}
