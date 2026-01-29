import { loadService } from "../testBase";
import fs from "node:fs/promises";

(async () => {
  const toImageService = await loadService();
  // await toImageService.fontManagement.loadFontDir([
  //   "C:\\Users\\root\\Downloads\\e",
  // ]);

  const html = `<div style="display: flex;flex-direction:column;background-color: #fff"><div>🍄🐙🌋🧬🧿🌙🐚🐲</div><div>🤝🏾🦸‍♂️🤺🏿🧚🫧🫂🏄‍♀️🧗</div></div>`;
  const r = toImageService.toReactElement.htmlToReactElement(html);

  // const fonts = toImageService.fontManagement.getFonts({
  //   formats: toImageService.fontManagement.FontExt,
  //   needColr: true,
  //   fallbackSizeMax: 9999999,
  // });
  //
  // for (let font of fonts) {
  //   const png = await toImageService.takumiRenderer.render(r, undefined, [
  //     font.family,
  //   ]);
  //   await fs.writeFile(`./takumi-${font.family}.png`, png);
  // }
  const png = await toImageService.takumiRenderer.render(r);
  await fs.writeFile(`./takumi-.png`, png);
})();
