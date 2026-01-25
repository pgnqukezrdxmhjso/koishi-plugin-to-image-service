import { ReactElement } from "react";
import { renderSvg, VercelSatoriOptions as SatoriOptions } from "./satori/og";
import { FontManagement } from "./fontManagement";
import { BeanHelper } from "koishi-plugin-rzgtboeyndxsklmq-commons";
import ToImageService from "./index";
import type Satori from "satori";

export namespace SatoriRenderer {
  export type VercelSatoriOptions = SatoriOptions;
}

export class SatoriRenderer extends BeanHelper.BeanType<ToImageService.Config> {
  readonly FontFormats: FontManagement.FontFormat[] = ["ttf", "otf", "woff"];
  readonly FontVariable = false;

  private satori: typeof Satori;
  private fontManagement: FontManagement;

  constructor(beanHelper: BeanHelper<ToImageService.Config>) {
    super(beanHelper);
    this.fontManagement = beanHelper.instance(FontManagement);
  }

  async getSatori() {
    if (!this.satori) {
      this.satori = (await import("satori")).default;
    }
    return this.satori;
  }

  async render(
    reactElement: ReactElement<any, any>,
    options?: SatoriRenderer.VercelSatoriOptions,
  ) {
    options ||= {};
    const fonts = this.fontManagement.getFonts({
      formats: this.FontFormats,
      needVariable: this.FontVariable,
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
    return renderSvg(await this.getSatori(), options, reactElement);
  }
}
