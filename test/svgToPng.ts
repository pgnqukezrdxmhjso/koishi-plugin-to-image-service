import fs from "node:fs/promises";
import ToImageService from "../src";
import WNode from "koishi-plugin-w-node";
import path from "node:path";
import * as os from "node:os";

(async () => {
  const command = {
    action() {
      return command;
    },
    option() {
      return command;
    },
  };
  const node = new WNode(
    {
      command() {
        return command;
      },
    } as any,
    {
      packagePath: path.resolve(os.tmpdir(), "w-node"),
      registry: "https://registry.npmmirror.com/",
    },
  );
  await node.start();

  const toImageService = new ToImageService({ node } as any, {});
  await toImageService.start();

  const svg = await fs.readFile("./test.svg", "utf-8");

  console.time("resvg");
  await fs.writeFile(
    "./svgToPng-resvg.png",
    await toImageService.svgToImage.resvg(svg),
  );
  console.timeEnd("resvg");

  console.time("vips");
  await fs.writeFile(
    "./svgToPng-vips.png",
    await toImageService.svgToImage.vips(svg, {
      format: "png",
      options: {
        compression: 5,
      },
    }),
  );
  console.timeEnd("vips");

  console.time("skiaCanvas");
  await fs.writeFile(
    "./svgToPng-skia.png",
    await toImageService.svgToImage.skiaCanvas(svg, "png"),
  );
  console.timeEnd("skiaCanvas");

  console.time("skiaCanvasCanvg");
  await fs.writeFile(
    "./svgToPng-skia-canvg.png",
    await toImageService.svgToImage.skiaCanvasCanvg(svg, "png"),
  );
  console.timeEnd("skiaCanvasCanvg");
})();
