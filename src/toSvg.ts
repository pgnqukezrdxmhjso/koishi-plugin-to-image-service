import { BeanHelper } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import { ReactElement } from "react";
import type Satori from "satori";

import { renderSvg, VercelSatoriOptions as SatoriOptions } from "./satori/og";
import { FontManagement } from "./fontManagement";
import type { Config } from "./config";

export namespace SatoriRenderer {
  export type VercelSatoriOptions = SatoriOptions;
}

export class SatoriRenderer extends BeanHelper.BeanType<Config> {
  readonly FontFormats: FontManagement.FontFormat[] = ["ttf", "otf", "woff"];

  private satori: typeof Satori;
  private fontManagement: FontManagement;

  constructor(beanHelper: BeanHelper<Config>) {
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
    preferredFamilyNames?: string[],
  ) {
    options ||= {};
    if (!options.emoji) {
      options.emoji = this.config?.font?.satoriDefaultEmojiType;
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
    return renderSvg(await this.getSatori(), options, reactElement);
  }
}
