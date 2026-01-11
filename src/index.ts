import { Context, Schema, Service } from "koishi";

import { initToImage, svgToImage, toImageBase } from "./toImage";
import {
  initToSvg,
  reactElementToSvg,
  toReactElement,
  toSvgBase,
} from "./toSvg";

import { Font, VercelSatoriOptions } from "./og";
export { Font, VercelSatoriOptions } from "./og";

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
    await initToSvg(this.fonts);
    await initToImage();
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
