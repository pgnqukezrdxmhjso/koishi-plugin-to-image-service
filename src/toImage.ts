import path from "node:path";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

import { Context } from "koishi";

import SkiaCanvas, { AvifConfig } from "@napi-rs/canvas";
import { Canvg } from "canvg";
import { JSDOM } from "jsdom";
import Vips from "wasm-vips";
import * as Resvg from "@resvg/resvg-wasm";

export interface ResvgOptions {
  format?: "png";
  options?: Resvg.ResvgRenderOptions;
}

export type VipsOptions =
  | {
      format: "png";
      options?: Parameters<Vips.Image["pngsaveBuffer"]>[0];
    }
  | {
      format: "webp";
      options?: Parameters<Vips.Image["webpsaveBuffer"]>[0];
    }
  | {
      format: "gif";
      options?: Parameters<Vips.Image["gifsaveBuffer"]>[0];
    }
  | {
      format: "jpeg";
      options?: Parameters<Vips.Image["jpegsaveBuffer"]>[0];
    }
  | {
      format: "jxl";
      options?: Parameters<Vips.Image["jxlsaveBuffer"]>[0];
    }
  | {
      format: "tiff";
      options?: Parameters<Vips.Image["tiffsaveBuffer"]>[0];
    }
  | {
      format: "heif";
      options?: Parameters<Vips.Image["heifsaveBuffer"]>[0];
    }
  | {
      format: "rad";
      options?: Parameters<Vips.Image["radsaveBuffer"]>[0];
    }
  | {
      format: "raw";
      options?: Parameters<Vips.Image["rawsaveBuffer"]>[0];
    };

const skiaCanvasName = "@napi-rs/canvas";

let vips: typeof Vips;
let skiaCanvas: typeof SkiaCanvas;
export async function initToImage(ctx: Context) {
  // const packageJson = JSON.parse(
  //   await fs.readFile(path.resolve(__dirname, "../package.json"), "utf8"),
  // );
  // await ctx.node.install(
  //   skiaCanvasName,
  //   (packageJson?.devDependencies?.[skiaCanvasName] as string)?.replace(
  //     /[^\d.]/,
  //     "",
  //   ),
  // );
  skiaCanvas = await ctx.node.safeImport(skiaCanvasName);

  vips = await Vips({
    dynamicLibraries: ["vips-resvg.wasm", "vips-jxl.wasm", "vips-heif.wasm"],
  });

  const require = createRequire("file:///" + __filename);
  const reSvgWasm = path.join(
    path.dirname(require.resolve("@resvg/resvg-wasm")),
    "index_bg.wasm",
  );
  try {
    await Resvg.initWasm(await fs.readFile(reSvgWasm));
  } catch (e) {
    if (!(e + "").includes("initialized")) {
      throw e;
    }
  }
}

export const toImageBase = {
  getResvg() {
    return Resvg;
  },
  getVips() {
    return vips;
  },
  getSkiaCanvas() {
    return skiaCanvas;
  },
};

export class SvgToImage {
  async resvg(svg: string, options?: ResvgOptions): Promise<Uint8Array> {
    const resvg = new Resvg.Resvg(svg, options?.options);
    let imgData: ReturnType<typeof resvg.render>;
    try {
      imgData = resvg.render();
      return imgData.asPng();
    } finally {
      imgData?.free();
      resvg.free();
    }
  }

  async vips(svg: string, options: VipsOptions): Promise<Uint8Array> {
    const img = vips.Image.svgloadBuffer(Buffer.from(svg), {
      unlimited: true,
    });
    try {
      return img[options.format + "saveBuffer"](options.options || {});
    } finally {
      img.delete();
    }
  }

  skiaCanvas(
    svg: string,
    format: "webp" | "jpeg",
    quality?: number,
  ): Promise<Uint8Array>;
  skiaCanvas(svg: string, format: "png"): Promise<Uint8Array>;
  skiaCanvas(
    svg: string,
    format: "avif",
    cfg?: AvifConfig,
  ): Promise<Uint8Array>;
  skiaCanvas(svg: string, format: "gif", quality?: number): Promise<Uint8Array>;
  async skiaCanvas(
    svg: string,
    format: string,
    options?: any,
  ): Promise<Uint8Array> {
    const img = await skiaCanvas.loadImage(Buffer.from(svg));
    const canvas = new skiaCanvas.Canvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return await canvas.encode(format as any, options);
  }

  skiaCanvasCanvg(
    svg: string,
    format: "webp" | "jpeg",
    quality?: number,
  ): Promise<Uint8Array>;
  skiaCanvasCanvg(svg: string, format: "png"): Promise<Uint8Array>;
  skiaCanvasCanvg(
    svg: string,
    format: "avif",
    cfg?: AvifConfig,
  ): Promise<Uint8Array>;
  skiaCanvasCanvg(
    svg: string,
    format: "gif",
    quality?: number,
  ): Promise<Uint8Array>;
  async skiaCanvasCanvg(
    svg: string,
    format: string,
    options?: any,
  ): Promise<Uint8Array> {
    const canvas = new skiaCanvas.Canvas(1, 1);
    const ctx = canvas.getContext("2d");
    const dom = new JSDOM();
    const v = Canvg.fromString(ctx as any, svg, {
      window: dom.window as any,
      DOMParser: dom.window.DOMParser as any,
      createCanvas: (w, h) => new skiaCanvas.Canvas(w, h) as any,
      createImage: skiaCanvas.Image as any,
      ignoreDimensions: false,
    });
    await v.render();
    return await canvas.encode(format as any, options);
  }
}
