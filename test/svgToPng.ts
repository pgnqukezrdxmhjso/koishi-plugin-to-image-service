import fs from "node:fs/promises";
import ToImageService from "../src";

(async () => {
  const toImageService = new ToImageService({} as any, {});
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
    await toImageService.svgToImage.skiaCanvas(svg, {
      format: "png",
    }),
  );
  console.timeEnd("skiaCanvas");

  console.time("skiaCanvasCanvg");
  await fs.writeFile(
    "./svgToPng-skia-canvg.png",
    await toImageService.svgToImage.skiaCanvasCanvg(svg, {
      format: "png",
    }),
  );
  console.timeEnd("skiaCanvasCanvg");
})();
