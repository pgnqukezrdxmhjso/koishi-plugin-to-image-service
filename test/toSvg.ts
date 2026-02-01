import fs from "fs/promises";
import { loadService } from "./testBase";

(async () => {
  const toImageService = await loadService();

  const reactElement = await toImageService.toReactElement.jsxToReactElement(
    await fs.readFile("./test.jsx", "utf8"),
  );
  const svg = await toImageService.satoriRenderer.render({ reactElement });
  await fs.writeFile("./test.svg", svg);
})();
