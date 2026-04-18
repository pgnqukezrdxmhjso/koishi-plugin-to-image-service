import {
  BeanHelper,
  Strings,
  Locks,
  Objects,
} from "koishi-plugin-rzgtboeyndxsklmq-commons";

import type { ReactElement } from "react";
import type TakumiType from "@takumi-rs/core";
import type { Node as TakumiNode } from "@takumi-rs/helpers";
import { extractResourceUrls } from "@takumi-rs/helpers";
import { extractEmojis } from "@takumi-rs/helpers/emoji";
import { fromJsx } from "@takumi-rs/helpers/jsx";

import type SharpType from "sharp";
import type ResvgType from "@resvg/resvg-js";

import type SkiaCanvasType from "@napi-rs/canvas";
import { Canvg } from "canvg";
import { JSDOM } from "jsdom";

import type { Config } from "./config";
import { FontManagement } from "./fontManagement";
import { importPackage, installPackage, replaceCDN } from "./util";
import { ResourceCache } from "./cache";

export namespace SkiaCanvasRenderer {
  export type SkiaCanvasOptions =
    | {
        format: "webp" | "jpeg";
        quality?: number;
      }
    | {
        format: "png";
      }
    | {
        format: "avif";
        cfg?: SkiaCanvasType.AvifConfig;
      }
    | {
        format: "gif";
        quality?: number;
      };
}
export class SkiaCanvasRenderer extends BeanHelper.BeanType<Config> {
  readonly SkiaCanvasPackageName = "@napi-rs/canvas";
  private skiaCanvas: typeof SkiaCanvasType;

  async start() {
    await installPackage(this.ctx, this.SkiaCanvasPackageName);
  }

  private getSkiaCanvasLock = Symbol("getSkiaCanvasLock");
  async getSkiaCanvas() {
    if (!this.skiaCanvas) {
      await Locks.coalesce(this.getSkiaCanvasLock, async () => {
        this.skiaCanvas = await importPackage(
          this.ctx,
          this.SkiaCanvasPackageName,
        );
      });
    }
    return this.skiaCanvas;
  }

  private getOption(options: SkiaCanvasRenderer.SkiaCanvasOptions) {
    switch (options.format) {
      case "webp":
      case "jpeg": {
        return options.quality;
      }
      case "avif": {
        return options.cfg;
      }
      case "gif": {
        return options.quality;
      }
      default: {
        return undefined;
      }
    }
  }

  async render({
    source,
    options,
  }: {
    source: Buffer;
    options: SkiaCanvasRenderer.SkiaCanvasOptions;
  }) {
    const skiaCanvas = await this.getSkiaCanvas();
    const img = await skiaCanvas.loadImage(source);
    const canvas = new skiaCanvas.Canvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return await canvas.encode(
      options.format as any,
      this.getOption(options) as any,
    );
  }

  async renderByCanvg({
    svg,
    options,
  }: {
    svg: string;
    options: SkiaCanvasRenderer.SkiaCanvasOptions;
  }) {
    const skiaCanvas = await this.getSkiaCanvas();
    const canvas = new skiaCanvas.Canvas(1, 1);
    const ctx = canvas.getContext("2d");
    const dom = new JSDOM();
    const v = Canvg.fromString(ctx as any, svg, {
      window: dom.window as any,
      DOMParser: dom.window.DOMParser as any,
      createCanvas: (w, h) => new skiaCanvas.Canvas(w, h) as any,
      createImage: skiaCanvas.Image as any,
      ignoreDimensions: false,
    });
    await v.render();
    return await canvas.encode(
      options.format as any,
      this.getOption(options) as any,
    );
  }
}

export class SharpRenderer extends BeanHelper.BeanType<Config> {
  readonly SharpPackageName = "sharp";
  private sharp: typeof SharpType;

  async start() {
    await installPackage(this.ctx, this.SharpPackageName);
  }

  private getSharpLock = Symbol("getSharpLock");
  async getSharp() {
    if (!this.sharp) {
      await Locks.coalesce(this.getSharpLock, async () => {
        this.sharp = (await importPackage(this.ctx, this.SharpPackageName))[
          "default"
        ];
      });
    }
    return this.sharp;
  }

  async render({
    source,
    sharpOptions,
    format,
    formatOptions,
  }: {
    source: Buffer;
    sharpOptions?: SharpType.SharpOptions;
    format: Parameters<SharpType.Sharp["toFormat"]>[0];
    formatOptions?: Parameters<SharpType.Sharp["toFormat"]>[1];
  }): Promise<Uint8Array> {
    const sharp = await this.getSharp();
    return await sharp(source, sharpOptions)
      .toFormat(format, formatOptions)
      .toBuffer();
  }
}

export class ResvgRenderer extends BeanHelper.BeanType<Config> {
  readonly ResvgPackageName = "@resvg/resvg-js";
  readonly FontFormats: FontManagement.FontFormat[] = ["ttf", "otf"];
  readonly FontVariable = true;

  private resvg: typeof ResvgType;

  private fontManagement = this.beanHelper.instance(FontManagement);

  async start() {
    await installPackage(this.ctx, this.ResvgPackageName);
  }

  private getResvgLock = Symbol("getResvgLock");
  async getResvg() {
    if (!this.resvg) {
      await Locks.coalesce(this.getResvgLock, async () => {
        this.resvg = await importPackage(this.ctx, this.ResvgPackageName);
      });
    }
    return this.resvg;
  }

  async render({
    svg,
    options,
    preferredFamilyNames,
  }: {
    svg: string;
    options?: ResvgType.ResvgRenderOptions;
    preferredFamilyNames?: string[];
  }): Promise<Uint8Array> {
    options ||= {};
    options.font ||= {};
    if (!("loadSystemFonts" in options.font)) {
      options.font.loadSystemFonts = false;
    }

    if (svg.includes("</text>")) {
      const fonts = this.fontManagement.getFonts({
        formats: this.FontFormats,
        needVariable: this.FontVariable,
        preferredFamilyNames,
      });
      if (fonts.length > 0) {
        options.font.fontFiles ||= [];
        fonts.map((font) => options.font.fontFiles.push(font.filePath));
      } else {
        options.font.loadSystemFonts = true;
      }
    }
    const resvgJs = await this.getResvg();
    const img = await resvgJs.renderAsync(svg, options);
    return img.asPng();
  }
}

export class TakumiRenderer extends BeanHelper.BeanType<Config> {
  readonly TakumiPackageName = "@takumi-rs/core";
  readonly FontFormats: FontManagement.FontFormat[] = [
    "ttf",
    "otf",
    "woff",
    "woff2",
  ];
  readonly FontVariable = true;
  readonly FontColr: FontManagement.ColrVer[] = [0];

  private takumi: typeof TakumiType;
  private renderer: TakumiType.Renderer;

  private fontManagement = this.beanHelper.instance(FontManagement);
  private resourceCache = this.beanHelper.instance(ResourceCache);

  async start() {
    await installPackage(this.ctx, this.TakumiPackageName);
    this.fontManagement.eventEmitter.on("fontChange", () => {
      this.renderer = null;
    });
  }

  async destroy() {}

  private getTakumiLock = Symbol("getTakumiLock");
  async getTakumi() {
    if (!this.takumi) {
      await Locks.coalesce(this.getTakumiLock, async () => {
        this.takumi = await importPackage(this.ctx, this.TakumiPackageName);
      });
    }
    return this.takumi;
  }

  private getRendererLock = Symbol("getRendererLock");
  async getRenderer() {
    if (this.renderer) {
      return this.renderer;
    }

    await Locks.coalesce(this.getRendererLock, async () => {
      const takumi = await this.getTakumi();
      const fonts = this.fontManagement.getFonts({
        formats: this.FontFormats,
        needVariable: this.FontVariable,
        needColr: this.FontColr,
        needDefaultEmojiFont: true,
        applyConfig: false,
        allowFallbackEmoji: true,
        fallbackSizeMax: -1,
      });

      this.renderer = new takumi.Renderer({
        fonts: fonts.length < 1 ? undefined : fonts.map((font) => font.data),
      });
    });
    return this.renderer;
  }

  async loadNodeResource(
    node: TakumiNode,
    fetchedResources?: TakumiType.ImageSource[],
  ) {
    fetchedResources ||= [];
    const resourceUrls = extractResourceUrls(node).filter((url) =>
      fetchedResources.every((r) => r.src !== url),
    );

    if (resourceUrls?.length < 1) {
      return fetchedResources;
    }

    await Promise.all(
      resourceUrls.map(async (src) => {
        try {
          const res = await this.resourceCache.fetch(src);
          fetchedResources.push({ src, data: res });
        } catch (e) {
          if (this.config?.logInfo) {
            this.ctx.logger.error(src, e);
          }
        }
      }),
    );

    return fetchedResources;
  }

  private async _render({
    node,
    renderer,
    options,
    useFontEmoji = true,
  }: {
    node: TakumiType.Node;
    renderer: TakumiType.Renderer;
    options: TakumiType.RenderOptions;
    useFontEmoji?: boolean;
  }) {
    if (useFontEmoji && !this.config?.font?.takumiUseFontEmoji) {
      node = extractEmojis(
        node,
        this.config?.font?.defaultEmojiType || "twemoji",
      );
      await Objects.deepForEach(
        node,
        async (n: TakumiNode) => {
          if (n?.type !== "image" || typeof n?.src !== "string") {
            return;
          }
          n.src = replaceCDN(n.src, this.config?.font?.CDNNode);
        },
        {
          onValue: false,
        },
      );
    }

    options ||= {};
    options.fetchedResources = await this.loadNodeResource(
      node,
      options.fetchedResources,
    );
    try {
      return await renderer.render(node, options);
    } catch (e) {
      if (e instanceof Error && e.stack.endsWith(e.message)) {
        throw new Error(e.message);
      }
      throw e;
    }
  }

  async render({
    reactElement,
    options,
    preferredFamilyNames,
  }: {
    reactElement: ReactElement<any, any>;
    options?: TakumiType.RenderOptions;
    preferredFamilyNames?: string[];
  }): Promise<Uint8Array> {
    const renderer = await this.getRenderer();
    const { node } = await fromJsx(reactElement);

    const fonts = this.fontManagement.getFonts({
      formats: this.FontFormats,
      needVariable: this.FontVariable,
      needColr: this.FontColr,
      needDefaultEmojiFont: true,
      preferredFamilyNames,
    });

    const fontFamily = Strings.isBlank(node.style?.fontFamily)
      ? []
      : node.style.fontFamily.split(",");
    fontFamily.push(...this.fontManagement.getFamilyNames(fonts));

    node.style ||= {};
    node.style.fontFamily = fontFamily.join(",");

    return this._render({ node, renderer, options });
  }

  async renderOneFont({
    reactElement,
    options,
    familyName,
  }: {
    reactElement: ReactElement<any, any>;
    options?: TakumiType.RenderOptions;
    familyName: string;
  }) {
    const takumi = await this.getTakumi();
    const fonts = this.fontManagement.getFonts({
      formats: this.FontFormats,
      needVariable: this.FontVariable,
      needColr: this.FontColr,
      preferredFamilyNames: [familyName],
      applyConfig: false,
      needFallback: false,
      needDefaultFonts: false,
      allowOnlyEmoji: true,
    });
    const renderer = new takumi.Renderer({
      fonts: fonts.length < 1 ? undefined : fonts.map((font) => font.data),
    });

    const { node } = await fromJsx(reactElement);
    return this._render({ node, renderer, options, useFontEmoji: false });
  }
}
