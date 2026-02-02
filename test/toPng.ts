import fs from "node:fs/promises";
import { loadService } from "./testBase";
import { Test } from "koishi-plugin-rzgtboeyndxsklmq-commons";
import test = Test.test;

(async () => {
  const toImageService = await loadService();

  const count = 30;
  const save = false;
  const jsx = await fs.readFile("./test.jsx", "utf8");

  await test(count, [
    {
      name: "satori",
      fn: async () => {
        const svg = await toImageService.satoriRenderer.render({
          reactElement:
            await toImageService.toReactElement.jsxToReactElement(jsx),
        });
        save && (await fs.writeFile("./test.svg", svg));
      },
    },
    {
      name: "resvg",
      fn: async () => {
        const png = await toImageService.resvgRenderer.render({
          svg: await toImageService.satoriRenderer.render({
            reactElement:
              await toImageService.toReactElement.jsxToReactElement(jsx),
          }),
        });
        save && (await fs.writeFile("./svgToPng-resvg.png", png));
      },
    },
    {
      name: "sharp",
      fn: async () => {
        const png = await toImageService.sharpRenderer.render({
          source: Buffer.from(
            await toImageService.satoriRenderer.render({
              reactElement:
                await toImageService.toReactElement.jsxToReactElement(jsx),
            }),
          ),
          format: "png",
        });
        save && (await fs.writeFile("./svgToPng-sharp.png", png));
      },
    },
    {
      name: "skiaCanvas",
      fn: async () => {
        const png = await toImageService.skiaCanvasRenderer.render({
          source: Buffer.from(
            await toImageService.satoriRenderer.render({
              reactElement:
                await toImageService.toReactElement.jsxToReactElement(jsx),
            }),
          ),
          options: {
            format: "png",
          },
        });
        save && (await fs.writeFile("./svgToPng-skia.png", png));
      },
    },
    {
      name: "skiaCanvasCanvg",
      fn: async () => {
        const png = await toImageService.skiaCanvasRenderer.renderByCanvg({
          svg: await toImageService.satoriRenderer.render({
            reactElement:
              await toImageService.toReactElement.jsxToReactElement(jsx),
          }),
          options: {
            format: "png",
          },
        });
        save && (await fs.writeFile("./svgToPng-skia-canvg.png", png));
      },
    },
    {
      name: "takumi",
      fn: async () => {
        const png = await toImageService.takumiRenderer.render({
          reactElement:
            await toImageService.toReactElement.jsxToReactElement(jsx),
          options: {
            format: "png",
          },
        });
        save && (await fs.writeFile("./jsxToPng-takumi.png", png));
      },
    },
  ]);
})();
