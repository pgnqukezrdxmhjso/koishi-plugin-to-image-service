import { loadService } from "../testBase";
import fs from "node:fs/promises";
import { fetchResources } from "@takumi-rs/helpers";

(async () => {
  const toImageService = await loadService();

  const jsx = await fs.readFile("./url.jsx", "utf8");
  const reactElement =
    await toImageService.toReactElement.jsxToReactElement(jsx);


  const fetchedResources = await fetchResources([
    "https://dummyimage.com/50x50/6e2d6e/c2c5ed.png",
  ]);

  const image = await toImageService.takumiRenderer.render({
    reactElement,
    options: {
      fetchedResources,
    },
  });
  await fs.writeFile("./url.png", image);

  const svg = await toImageService.satoriRenderer.render({ reactElement });
  await fs.writeFile("./url.svg", svg);
})();
