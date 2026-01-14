import { ReactElement } from "react";
import { initSatori, getSatori, renderSvg } from "./Satori";
import { VercelSatoriOptions } from "./og";
import fontManagement, { FontFormat } from "./fontManagement";

export async function initToSvg() {
  await initSatori();
}

export const toSvgBase = {
  getSatori,
};

const fontFormats: FontFormat[] = ["ttf", "otf", "woff"];
export const reactElementToSvg = {
  async satori(
    reactElement: ReactElement<any, any>,
    options?: VercelSatoriOptions,
  ) {
    options ||= {};
    const fonts = fontManagement.getFonts(fontFormats);
    if (fonts.length > 0) {
      options.fonts ||= [];
      options.fonts.push(...fonts);
    }
    return renderSvg(reactElement, options);
  },
};
