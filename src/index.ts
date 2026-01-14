import fs from "node:fs";
import path from "node:path";

import { Context, Schema, Service } from "koishi";
// noinspection ES6UnusedImports
import {} from "koishi-plugin-w-node";

import fontManagement, { Font } from "./fontManagement";
import { toReactElement } from "./toReactElement";
import {
  initToSvg,
  reactElementToSvg,
  toSvgBase,
} from "./toSvg";
import { initToImage, SvgToImage, toImageBase } from "./toImage";
import { VercelSatoriOptions } from "./og";


export { Font, FontWeight, FontStyle, FontFormat } from "./fontManagement";
export { VercelSatoriOptions } from "./og";
export { VipsOptions, ResvgOptions } from "./toImage";

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
    await initToImage(this._ctx);
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
  svgToImage = new SvgToImage();

  async htmlToImage(htmlCode: string, satoriOptions?: VercelSatoriOptions) {
    const reactElement = toReactElement.htmlToReactElement(htmlCode);
    const svg = await reactElementToSvg.satori(reactElement, satoriOptions);
    return await this.svgToImage.resvg(svg);
  }

  async jsxToImage(
    jsxCode: string,
    data?: Record<any, any>,
    satoriOptions?: VercelSatoriOptions,
  ) {
    const reactElement = await toReactElement.jsxToReactElement(jsxCode, data);
    const svg = await reactElementToSvg.satori(reactElement, satoriOptions);
    return await this.svgToImage.resvg(svg);
  }
}
const readme = fs
  .readFileSync(path.join(__dirname, "../readme.md"))
  .toString()
  .replace(/^[\s\S]*# VersionHistory/, "");
namespace ToImageService {
  export const usage = readme;

  export const inject = ["node"];

  export interface Config {}
  export const Config: Schema<Config> = Schema.object({});
}

export default ToImageService;
