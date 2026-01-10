import SkiaCanvas, { ExportFormat, ExportOptions } from "skia-canvas";
import { Canvg } from "canvg";
import { JSDOM } from "jsdom";
import Vips from "wasm-vips";
import * as Resvg from "@resvg/resvg-wasm";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs/promises";

export type ToImageOptions =
  | {
      type: "resvg";
      format?: "png";
      options?: Resvg.ResvgRenderOptions;
    }
  | ({
      type: "vips";
    } & (
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
        }
    ))
  | {
      type: "skiaCanvas";
      format: ExportFormat;
      options?: ExportOptions;
    }
  | {
      type: "skiaCanvasCanvg";
      format: ExportFormat;
      options?: ExportOptions;
    };

let vips: typeof Vips;
export async function initImage() {
  vips = await Vips({
    dynamicLibraries: ["vips-resvg.wasm", "vips-jxl.wasm", "vips-heif.wasm"],
  });

  const require = createRequire("file:///" + __filename);
  const reSvgWasm = path.join(
    path.dirname(require.resolve("@resvg/resvg-wasm")),
    "index_bg.wasm",
  );
  await Resvg.initWasm(await fs.readFile(reSvgWasm));
}

export function getResvg() {
  return Resvg;
}
export function getVips() {
  return vips;
}
export function getSkiaCanvas() {
  return SkiaCanvas;
}

export const fromSvg: {
  [K in ToImageOptions["type"]]: (
    svg: string,
    options: ToImageOptions & { type: K },
  ) => Promise<Uint8Array>;
} = {
  async resvg(svg, options) {
    const resvgJS = new Resvg.Resvg(svg, options.options);
    const imgData = resvgJS.render();
    const imgBuffer = imgData.asPng();
    imgData.free();
    resvgJS.free();
    return imgBuffer;
  },
  async vips(svg, options) {
    const img = vips.Image.svgloadBuffer(Buffer.from(svg), {
      unlimited: true,
    });
    const imgBuffer = img[options.format + "saveBuffer"](options.options || {});
    img.delete();
    return imgBuffer;
  },
  async skiaCanvas(svg, options) {
    const img = await SkiaCanvas.loadImage(Buffer.from(svg));
    const canvas = new SkiaCanvas.Canvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return await canvas.toBuffer(options.format, options.options);
  },
  async skiaCanvasCanvg(svg, options) {
    const canvas = new SkiaCanvas.Canvas(1, 1);
    const ctx = canvas.getContext("2d");
    const dom = new JSDOM();
    const v = Canvg.fromString(ctx as any, svg, {
      window: dom.window as any,
      DOMParser: dom.window.DOMParser as any,
      createCanvas: (w, h) => new SkiaCanvas.Canvas(w, h) as any,
      createImage: SkiaCanvas.Image as any,
      ignoreDimensions: false,
    });
    await v.render();
    return canvas.toBuffer(options.format, options.options);
  },
};

export async function svgToImage(svg: string, options: ToImageOptions) {
  return fromSvg[options.type](svg, options as never);
}
