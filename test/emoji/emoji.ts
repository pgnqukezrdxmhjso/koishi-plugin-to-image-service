import { loadService } from "../testBase";
import fs from "node:fs/promises";

(async () => {
  const config = {
    font: {
      satoriDefaultEmojiType: null,
      logInfo: true,
    },
  };
  const toImageService = await loadService(config);

  const html = `<div style="display: flex;flex-direction:column;background-color: #fff"><div>🍄🐙🌋🧬🧿🌙🐚🐲</div><div>🤝🏾🦸‍♂️🤺🏿🧚🫧🫂🏄‍♀️🧗</div></div>`;
  const reactElement = toImageService.toReactElement.htmlToReactElement(html);

  await toImageService.fontManagement.loadFontDir([
    "C:\\Users\\root\\Downloads\\e",
  ]);
  const families = toImageService.fontManagement.getAllFamily(true);

  for (let family of families) {
    if (!family.members[0].emoji) {
      continue;
    }
    const png = await toImageService.takumiRenderer.renderOneFont({
      reactElement,
      familyName: family.family,
    });
    await fs.writeFile(`./takumi-${family.family}.png`, png);
  }

  const png = await toImageService.takumiRenderer.render({ reactElement });
  await fs.writeFile(`./takumi-.png`, png);

  // const emojiTypes = [
  //   "twemoji",
  //   "openmoji",
  //   "blobmoji",
  //   "noto",
  //   "fluent",
  //   "fluentFlat",
  // ];
  //
  // for (const emojiType of emojiTypes) {
  //   config.font.satoriDefaultEmojiType = emojiType;
  //   const png = await toImageService.sharpRenderer.render({
  //     source: Buffer.from(
  //       await toImageService.satoriRenderer.render({ reactElement }),
  //     ),
  //     format: "png",
  //   });
  //   await fs.writeFile(`satori-${emojiType}.png`, png);
  // }
})();
