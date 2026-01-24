import { BeanType } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import type { ReactElement } from "react";
import type * as TakumiType from "@takumi-rs/core";
import { fromJsx } from "@takumi-rs/helpers/jsx";

import type SharpType from "sharp";
import type ResvgType from "@resvg/resvg-js";

import type SkiaCanvasType from "@napi-rs/canvas";
import { Canvg } from "canvg";
import { JSDOM } from "jsdom";

import type ToImageService from "./index";
import { FontManagement } from "./fontManagement";
import { importPackage, installPackage } from "./util";

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
export class SkiaCanvasRenderer extends BeanType<ToImageService.Config> {
  readonly SkiaCanvasPackageName = "@napi-rs/canvas";
  private skiaCanvas: typeof SkiaCanvasType;

  async start() {
    await installPackage(this.ctx, this.SkiaCanvasPackageName);
  }

  async getSkiaCanvas() {
    if (!this.skiaCanvas) {
      this.skiaCanvas = await importPackage(
        this.ctx,
        this.SkiaCanvasPackageName,
      );
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

  async render(source: Buffer, options: SkiaCanvasRenderer.SkiaCanvasOptions) {
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

  async renderByCanvg(
    svg: string,
    options: SkiaCanvasRenderer.SkiaCanvasOptions,
  ) {
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

export class SharpRenderer extends BeanType<ToImageService.Config> {
  readonly SharpPackageName = "sharp";
  private sharp: typeof SharpType;

  async start() {
    await installPackage(this.ctx, this.SharpPackageName);
  }

  async getSharp() {
    if (!this.sharp) {
      this.sharp = (
        await importPackage(this.ctx, this.SharpPackageName)
      ).default;
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

export class ResvgRenderer extends BeanType<ToImageService.Config> {
  readonly ResvgPackageName = "@resvg/resvg-js";
  readonly FontFormats: FontManagement.FontFormat[] = ["ttf", "otf"];
  readonly FontVariable = true;

  private resvg: typeof ResvgType;

  private fontManagement = this.beanHelper.instance(FontManagement);

  async start() {
    await installPackage(this.ctx, this.ResvgPackageName);
  }

  async getResvg() {
    if (!this.resvg) {
      this.resvg = await importPackage(this.ctx, this.ResvgPackageName);
    }
    return this.resvg;
  }

  async render(
    svg: string,
    options?: ResvgType.ResvgRenderOptions,
  ): Promise<Uint8Array> {
    options ||= {};
    options.font ||= {};
    if (!("loadSystemFonts" in options.font)) {
      options.font.loadSystemFonts = false;
    }

    if (svg.includes("</text>")) {
      const fonts = this.fontManagement.getFonts({
        formats: this.FontFormats,
        needVariable: this.FontVariable,
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

export class TakumiRenderer extends BeanType<ToImageService.Config> {
  readonly TakumiPackageName = "@takumi-rs/core";
  readonly FontFormats: FontManagement.FontFormat[] = [
    "ttf",
    "otf",
    "woff",
    "woff2",
  ];
  readonly FontVariable = true;

  private takumi: typeof TakumiType;
  private fontManagement = this.beanHelper.instance(FontManagement);

  async start() {
    await installPackage(this.ctx, this.TakumiPackageName);
  }

  async destroy() {}

  async getTakumi() {
    if (!this.takumi) {
      this.takumi = await importPackage(this.ctx, this.TakumiPackageName);
    }
    return this.takumi;
  }

  async render(
    reactElement: ReactElement<any, any>,
    options?: TakumiType.RenderOptions,
  ): Promise<Uint8Array> {
    const fonts = this.fontManagement.getFonts({
      formats: this.FontFormats,
      needVariable: this.FontVariable,
    });
    const takumi = await this.getTakumi();
    const renderer = new takumi.Renderer({
      fonts: fonts.length < 1 ? undefined : fonts.map((font) => font.data),
    });
    return await renderer.render(await fromJsx(reactElement), options);
  }
}
