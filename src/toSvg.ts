import { transform } from "sucrase";
import React, { ReactElement } from "react";
import HtmlReactParser from "html-react-parser";
import { initSatori, getSatori, renderSvg } from "./Satori";
import { VercelSatoriOptions } from "./og";
import fontManagement from "./fontManagement";

const AsyncFunction: FunctionConstructor = (async () => 0)
  .constructor as FunctionConstructor;

export async function initToSvg() {
  await initSatori();
}

export const toSvgBase = {
  getSatori,
};

export const reactElementToSvg = {
  async satori(
    reactElement: ReactElement<any, any>,
    options?: VercelSatoriOptions,
  ) {
    options ||= {};
    const fonts = fontManagement.getFonts("satori");
    if (fonts.length > 0) {
      options.fonts ||= [];
      options.fonts.push(...fonts);
    }
    return renderSvg(reactElement, options);
  },
};

export const toReactElement = {
  async jsxToReactElement(jsxCode: string, data?: Record<any, any>) {
    const hCode = transform(jsxCode, {
      transforms: ["jsx"],
      jsxRuntime: "classic",
      production: true,
    }).code;
    const fn = AsyncFunction(
      "React",
      "_args_623601",
      "with (_args_623601) {\nreturn " + hCode.replace(/^\s+/, "") + "\n}",
    );
    let res: ReactElement<any, any> | Function;
    try {
      res = await fn(React, data || {});
    } catch (e) {
      e.message = fn.toString() + "\n" + e.message;
      throw e;
    }
    let i = 0;
    while (typeof res === "function" && i++ < 999) {
      res = await res();
    }
    return res as ReactElement<any, any>;
  },
  htmlToReactElement(htmlCode: string): ReactElement<any, any> {
    return HtmlReactParser(htmlCode) as ReactElement;
  },
};
