import fs from "node:fs/promises";
import { loadService } from "./testBase";
import { Test } from "koishi-plugin-rzgtboeyndxsklmq-commons";
import test2 = Test.test2;

(async () => {
  const toImageService = await loadService();

  const count = 30;
  const save = false;
  const jsx = await fs.readFile("./test.jsx", "utf8");

  await test2("satori", count, async () => {
    const svg = await toImageService.satoriRenderer.render(
      await toImageService.toReactElement.jsxToReactElement(jsx),
    );
    save && (await fs.writeFile("./test.svg", svg));
  });

  await test2("resvg", count, async () => {
    const png = await toImageService.resvgRenderer.render(
      await toImageService.satoriRenderer.render(
        await toImageService.toReactElement.jsxToReactElement(jsx),
      ),
    );
    save && (await fs.writeFile("./svgToPng-resvg.png", png));
  });

  await test2("sharp", count, async () => {
    const png = await toImageService.sharpRenderer.render({
      source: Buffer.from(
        await toImageService.satoriRenderer.render(
          await toImageService.toReactElement.jsxToReactElement(jsx),
        ),
      ),
      format: "png",
    });
    save && (await fs.writeFile("./svgToPng-sharp.png", png));
  });

  await test2("skiaCanvas", count, async () => {
    const png = await toImageService.skiaCanvasRenderer.render(
      Buffer.from(
        await toImageService.satoriRenderer.render(
          await toImageService.toReactElement.jsxToReactElement(jsx),
        ),
      ),
      {
        format: "png",
      },
    );
    save && (await fs.writeFile("./svgToPng-skia.png", png));
  });

  await test2("skiaCanvasCanvg", count, async () => {
    const png = await toImageService.skiaCanvasRenderer.renderByCanvg(
      await toImageService.satoriRenderer.render(
        await toImageService.toReactElement.jsxToReactElement(jsx),
      ),
      {
        format: "png",
      },
    );
    save && (await fs.writeFile("./svgToPng-skia-canvg.png", png));
  });

  await test2("takumi", count, async () => {
    const png = await toImageService.takumiRenderer.render(
      await toImageService.toReactElement.jsxToReactElement(jsx),
      {
        format: "png",
      },
    );
    save && (await fs.writeFile("./jsxToPng-takumi.png", png));
  });
})();
