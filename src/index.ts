import fs from "node:fs";
import path from "node:path";

import { Context, Service } from "koishi";
// noinspection ES6UnusedImports
import {} from "koishi-plugin-w-node";
import { BeanHelper } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import type * as TakumiType from "@takumi-rs/core";

import { Config as _Config } from "./config";
import ConsoleEx from "./consoleEx";
import { toReactElement } from "./toReactElement";
import { FontManagement } from "./fontManagement";
import { SatoriRenderer } from "./toSvg";
import {
  SkiaCanvasRenderer,
  SharpRenderer,
  ResvgRenderer,
  TakumiRenderer,
} from "./toImage";

export type * from "./fontManagement";
export type * from "./toSvg";
export type * from "./toImage";

const serviceName = "toImageService";

declare module "koishi" {
  interface Context {
    toImageService: ToImageService;
  }
}

class ToImageService extends Service {
  beanHelper: BeanHelper<ToImageService.Config> = new BeanHelper();

  toReactElement = toReactElement;

  fontManagement: FontManagement = this.beanHelper.instance(FontManagement);
  satoriRenderer: SatoriRenderer = this.beanHelper.instance(SatoriRenderer);
  skiaCanvasRenderer: SkiaCanvasRenderer =
    this.beanHelper.instance(SkiaCanvasRenderer);
  sharpRenderer: SharpRenderer = this.beanHelper.instance(SharpRenderer);
  resvgRenderer: ResvgRenderer = this.beanHelper.instance(ResvgRenderer);
  takumiRenderer: TakumiRenderer = this.beanHelper.instance(TakumiRenderer);

  constructor(
    private _ctx: Context,
    private _config: ToImageService.Config,
  ) {
    super(_ctx, serviceName);
    this.beanHelper.setCtx(_ctx, _config);
    this.beanHelper.instance(ConsoleEx);

    _ctx.on("dispose", async () => {
      await this.beanHelper.destroy();
      this.beanHelper = null;
    });
  }

  async start() {
    await this.beanHelper.start();
  }

  async htmlToImage(htmlCode: string, options?: TakumiType.RenderOptions) {
    const reactElement = toReactElement.htmlToReactElement(htmlCode);
    return await this.takumiRenderer.render(reactElement, options);
  }

  async jsxToImage(
    jsxCode: string,
    data?: Record<any, any>,
    options?: TakumiType.RenderOptions,
  ) {
    const reactElement = await toReactElement.jsxToReactElement(jsxCode, data);
    return await this.takumiRenderer.render(reactElement, options);
  }
}

const readme = fs.readFileSync(path.join(__dirname, "../readme.md"), "utf8");
namespace ToImageService {
  export const usage = readme;

  export const inject = ["node"];

  export const Config = _Config;
  export type Config = _Config;
}

export default ToImageService;
