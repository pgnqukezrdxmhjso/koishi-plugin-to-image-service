import fs from "node:fs/promises";
import { initImage, svgToImage } from "../src/toImage";

(async () => {
  await initImage();
  const svg = await fs.readFile("./test.svg", "utf-8");

  console.time("resvg");
  await fs.writeFile(
    "./svgToPng-resvg.png",
    await svgToImage(svg, {
      type: "resvg",
    }),
  );
  console.timeEnd("resvg");

  console.time("vips");
  await fs.writeFile(
    "./svgToPng-vips.png",
    await svgToImage(svg, {
      type: "vips",
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
    await svgToImage(svg, {
      type: "skiaCanvas",
      format: "png",
    }),
  );
  console.timeEnd("skiaCanvas");

  console.time("skiaCanvasCanvg");
  await fs.writeFile(
    "./svgToPng-skia-canvg.png",
    await svgToImage(svg, {
      type: "skiaCanvasCanvg",
      format: "png",
    }),
  );
  console.timeEnd("skiaCanvasCanvg");
})();
