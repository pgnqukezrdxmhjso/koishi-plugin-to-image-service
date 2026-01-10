import { Context, Schema, Service } from "koishi";
import type { ReactElement } from "react";

import { Readable } from "stream";
import { initSatori, renderSvg } from "./Satori";
import {
  initImage,
  getResvg,
  getVips,
  getSkiaCanvas,
  svgToImage,
  ToImageOptions,
} from "./toImage";
import { htmlToReactElement, jsxToReactElement } from "./toReactElement";

import { Font, SvgOptions } from "./og";
export { Font, SvgOptions } from "./og";

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
  private fonts: Font[] = [];

  constructor(ctx: Context, config: ToImageService.Config) {
    super(ctx, serviceName);
    this._ctx = ctx;
    this._config = config;
  }

  async start() {
    if (initialized) {
      return;
    }
    await initSatori();
    await initImage();
    initialized = true;
  }

  addFont(fonts: Font[]) {
    this.fonts.push(...fonts);
    this.ctx.on("dispose", () => {
      this.removeFont(fonts);
    });
  }

  removeFont(fonts: Font[]) {
    fonts.forEach((font) => {
      const index = this.fonts.indexOf(font);
      if (index === -1) {
        return;
      }
      this.fonts.splice(index, 1);
    });
  }

  getResvg() {
    return getResvg();
  }

  getVips() {
    return getVips();
  }

  getSkiaCanvas() {
    return getSkiaCanvas();
  }

  async reactElementToSvg(
    reactElement: ReactElement<any, any>,
    options?: SvgOptions,
  ): Promise<string> {
    options ||= {};
    if (this.fonts.length > 0) {
      options.fonts ||= [];
      options.fonts.push(...this.fonts);
    }
    return renderSvg(reactElement, options);
  }

  async svgToImage(svg: string, options: ToImageOptions) {
    return svgToImage(svg, options);
  }

  async reactElementToImage(args: {
    reactElement: ReactElement<any, any>;
    svgOptions?: SvgOptions;
    toImageOptions: ToImageOptions;
  }): Promise<Readable> {
    const svg = await this.reactElementToSvg(
      args.reactElement,
      args.svgOptions,
    );
    const img = await this.svgToImage(svg, args.toImageOptions);
    return Readable.from(Buffer.from(img));
  }

  async jsxToReactElement(jsxCode: string, data?: Record<any, any>) {
    return jsxToReactElement(jsxCode, data);
  }

  htmlToReactElement(htmlCode: string) {
    return htmlToReactElement(htmlCode);
  }

  async jsxToImage(args: {
    jsxCode: string;
    data?: Record<any, any>;
    toImageOptions: ToImageOptions;
    svgOptions?: SvgOptions;
  }): Promise<Readable> {
    return this.reactElementToImage({
      reactElement: await this.jsxToReactElement(args.jsxCode, args.data),
      toImageOptions: args.toImageOptions,
      svgOptions: args.svgOptions,
    });
  }

  htmlToImage(args: {
    htmlCode: string;
    toImageOptions: ToImageOptions;
    svgOptions?: SvgOptions;
  }): Promise<Readable> {
    return this.reactElementToImage({
      reactElement: this.htmlToReactElement(args.htmlCode),
      toImageOptions: args.toImageOptions,
      svgOptions: args.svgOptions,
    });
  }
}
namespace ToImageService {
  export const usage =
    "to svg<br/>" +
    'html to ReactElement <a target="_blank" href="https://www.npmjs.com/package/html-react-parser">html-react-parser</a><br/>' +
    'jsx to ReactElement <a target="_blank" href="https://www.npmjs.com/package/sucrase">sucrase</a><br/>' +
    'ReactElement to svg <a target="_blank" href="https://github.com/vercel/satori#overview">vercel/satori</a> ' +
    '<a target="_blank" href="https://og-playground.vercel.app/">og-playground</a><br/>' +
    "<hr/>" +
    "to png<br/>" +
    '<a target="_blank" href="https://www.npmjs.com/package/@resvg/resvg-wasm">@resvg/resvg-wasm</a><br/>' +
    '<a target="_blank" href="https://www.npmjs.com/package/wasm-vips">wasm-vips</a><br/>' +
    '<a target="_blank" href="https://www.npmjs.com/package/skia-canvas">skia-canvas</a> ' +
    '<a target="_blank" href="https://www.npmjs.com/package/canvg">canvg</a> ' +
    '<a target="_blank" href="https://www.npmjs.com/package/jsdom">jsdom</a><br/>';

  export interface Config {}
  export const Config: Schema<Config> = Schema.object({});
}

export default ToImageService;
