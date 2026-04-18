import { BeanHelper, Locks } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import type { ReactElement } from "react";
import type Satori from "satori";
import type { SatoriOptions } from "satori";

import { FontManagement } from "./fontManagement";
import type { Config } from "./config";
import { replaceCDN } from "./util";
import { ResourceCache } from "./cache";

export namespace SatoriRenderer {
  export type EmojiType = keyof typeof SatoriRenderer.emojiApis;
  export type VercelSatoriOptions = {
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
}

export class SatoriRenderer extends BeanHelper.BeanType<Config> {
  readonly FontFormats: FontManagement.FontFormat[] = ["ttf", "otf", "woff"];

  private U200D = String.fromCharCode(0x200d);
  private UFE0Fg = /\uFE0F/g;

  private satori: typeof Satori;
  private fontManagement = this.beanHelper.instance(FontManagement);
  private resourceCache = this.beanHelper.instance(ResourceCache);

  constructor(beanHelper: BeanHelper<Config>) {
    super(beanHelper);
  }

  private getSatoriLock = Symbol("getSatoriLock");
  async getSatori() {
    if (!this.satori) {
      await Locks.coalesce(this.getSatoriLock, async () => {
        this.satori = (await import("satori")).default;
      });
    }
    return this.satori;
  }

  static emojiApis = {
    twemoji: (code: string) =>
      `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg/${code.toLowerCase()}.svg`,
    openmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/",
    blobmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/",
    noto: (code: string) =>
      `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.051/svg/emoji_u${code.toLowerCase().replaceAll("-", "_")}.svg`,
    fluent: (code: string) =>
      "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/" +
      code.toLowerCase() +
      "_color.svg",
    fluentFlat: (code: string) =>
      "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/" +
      code.toLowerCase() +
      "_flat.svg",
  };

  private emojiUrl(code: string, type: SatoriRenderer.EmojiType) {
    const api = SatoriRenderer.emojiApis[type];
    let url =
      typeof api === "function" ? api(code) : `${api}${code.toUpperCase()}.svg`;
    url = replaceCDN(url, this.config?.font?.CDNNode);
    return url;
  }

  private getIconCode(char: string) {
    const unicodeSurrogates =
      char.indexOf(this.U200D) < 0 ? char.replace(this.UFE0Fg, "") : char;
    let r: string[] = [];
    let p = 0;
    for (let i = 0; i < unicodeSurrogates.length; i++) {
      const c = unicodeSurrogates.charCodeAt(i);
      if (p) {
        r.push((65536 + ((p - 55296) << 10) + (c - 56320)).toString(16));
        p = 0;
      } else if (55296 <= c && c <= 56319) {
        p = c;
      } else {
        r.push(c.toString(16));
      }
    }
    return r.join("-");
  }

  private static emptySvg = new ArrayBuffer();

  loadDynamicAsset(emoji: SatoriRenderer.EmojiType) {
    return async (code: string, text: string) => {
      if (code !== "emoji") {
        return [];
      }

      const url = this.emojiUrl(this.getIconCode(text), emoji);

      const svg = await this.resourceCache.fetch(url, {
        defaultValue: SatoriRenderer.emptySvg,
      });

      return `data:image/svg+xml;base64,` + Buffer.from(svg).toString("base64");
    };
  }

  async render({
    reactElement,
    options,
    preferredFamilyNames,
  }: {
    reactElement: ReactElement<any, any>;
    options?: SatoriRenderer.VercelSatoriOptions;
    preferredFamilyNames?: string[];
  }) {
    options ||= {};
    if (!options.emoji) {
      options.emoji = this.config?.font?.defaultEmojiType || "twemoji";
    }
    const fonts = this.fontManagement.getFonts({
      formats: this.FontFormats,
      preferredFamilyNames,
    });
    if (fonts.length > 0) {
      options.fonts ||= [];
      for (let font of fonts) {
        options.fonts.push({
          data: font.data,
          name: font.family,
          weight: font.weight,
          style: font.italic ? "italic" : "normal",
        });
      }
    }

    const satori = await this.getSatori();
    return await satori(reactElement, {
      width: options.width,
      height: options.height,
      debug: options.debug,
      fonts: options.fonts,
      loadAdditionalAsset: this.loadDynamicAsset(options.emoji),
    });
  }
}
