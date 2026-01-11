import fs from "node:fs/promises";
import { createRequire } from "node:module";

import type Satori from "satori";

import { ReactElement } from "react";
import { Font, VercelSatoriOptions, renderSvg as _renderSvg } from "./og";

let fontData: Buffer<ArrayBufferLike>;
let satori: typeof Satori;
export const initSatori = async () => {
  satori = (await import("satori")).default;
  const require = createRequire("file:///" + __filename);
  fontData = await fs.readFile(
    require.resolve("../assets/noto-sans-v27-latin-regular.ttf"),
  );
};

const getDefaultFonts = () =>
  [
    {
      name: "sans serif",
      data: fontData,
      weight: 700,
      style: "normal",
    },
  ] as Font[];

export const renderSvg = async (
  element: ReactElement<any, any>,
  options: VercelSatoriOptions,
) => {
  return _renderSvg(satori, options, getDefaultFonts(), element);
};

export function getSatori() {
  return satori;
}
