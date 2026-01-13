import { Context, Schema, Service } from "koishi";

import fontManagement, { Font } from "./fontManagement";
import { initToImage, svgToImage, toImageBase } from "./toImage";
import {
  initToSvg,
  reactElementToSvg,
  toReactElement,
  toSvgBase,
} from "./toSvg";
import { VercelSatoriOptions } from "./og";
import fs from "node:fs";
import path from "node:path";

export { VercelSatoriOptions } from "./og";
export { VipsOptions, ResvgOptions, SkiaCanvasOptions } from "./toImage";
export { Font, FontWeight, FontStyle, FontFormat } from "./fontManagement";

const serviceName = "toImageService";

declare module "koishi" {
  interface Context {
    toImageService: ToImageService;
  }
}

let initialized = false;

class ToImageService extends Service {
  private _ctx: Context;
  private _config: ToImageService.Config;

  constructor(ctx: Context, config: ToImageService.Config) {
    super(ctx, serviceName);
    this._ctx = ctx;
    this._config = config;
  }

  async start() {
    if (initialized) {
      return;
    }
    await initToSvg();
    await initToImage();
    initialized = true;
  }

  addFont(fonts: Font[]) {
    fontManagement.addFont(fonts);
    this.ctx.on("dispose", () => {
      fontManagement.removeFont(fonts);
    });
  }

  removeFont(fonts: Font[]) {
    fontManagement.removeFont(fonts);
  }

  toSvgBase = toSvgBase;
  reactElementToSvg = reactElementToSvg;
  toReactElement = toReactElement;

  toImageBase = toImageBase;
  svgToImage = svgToImage;

  async htmlToImage(htmlCode: string, satoriOptions?: VercelSatoriOptions) {
    const reactElement = toReactElement.htmlToReactElement(htmlCode);
    const svg = await reactElementToSvg.satori(reactElement, satoriOptions);
    return await svgToImage.resvg(svg);
  }

  async jsxToImage(
    jsxCode: string,
    data?: Record<any, any>,
    satoriOptions?: VercelSatoriOptions,
  ) {
    const reactElement = await toReactElement.jsxToReactElement(jsxCode, data);
    const svg = await reactElementToSvg.satori(reactElement, satoriOptions);
    return await svgToImage.resvg(svg);
  }
}
const readme = fs
  .readFileSync(path.join(__dirname, "../readme.md"))
  .toString()
  .replace(/^[\s\S]*# VersionHistory/, "");
namespace ToImageService {
  export const usage = readme;

  export interface Config {}
  export const Config: Schema<Config> = Schema.object({});
}

export default ToImageService;
