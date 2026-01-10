import { transform } from "sucrase";
import React, { ReactElement } from "react";
import HtmlReactParser from "html-react-parser";

const AsyncFunction: FunctionConstructor = (async () => 0)
  .constructor as FunctionConstructor;

export async function jsxToReactElement(
  jsxCode: string,
  data?: Record<any, any>,
) {
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
}
export function  htmlToReactElement(htmlCode: string): ReactElement<any, any> {
  return HtmlReactParser(htmlCode) as ReactElement;
}
