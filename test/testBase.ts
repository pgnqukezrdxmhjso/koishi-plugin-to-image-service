import WNode from "koishi-plugin-w-node";
import path from "node:path";
import ToImageService from "../src";

export async function loadService(config?: any) {
  config ||= {
    font: {
      takumiUseFontEmoji: true,
      defaultEmojiType: "twemoji",
    },
  } as ToImageService.Config;
  const command = {
    action() {
      return command;
    },
    option() {
      return command;
    },
    alias() {
      return command;
    },
  };
  const http = () => {};
  http.get = async (url: string, { headers, responseType }) => {
    const res = await fetch(url, { headers: headers });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return responseType === "text" ? res.text() : res.arrayBuffer();
  };
  const ctx = {
    command() {
      return command;
    },
    i18n: {
      define: (a, b) => b,
    },
    on: () => 0,
    logger: {
      error: console.error,
      info: console.log,
    },
    inject() {},
    http,
  };
  const node = new WNode(ctx as any, {
    packagePath: path.resolve(__dirname, "../../../cache/node"),
    registry: "https://registry.npmmirror.com/",
  });
  await node.start();

  const toImageService = new ToImageService(
    { ...ctx, node } as any,
    config as any,
  );
  await toImageService.start();
  await toImageService.fontManagement.loadFontDir([
    // "C:\\Users\\root\\Downloads\\e",
    // path.resolve("../../../to-image-service-font-jetbrains-mono"),
    // path.resolve("../../../to-image-service-font-source-han-mono-sc"),
    // path.resolve("../../../../data/font"),
    // path.resolve("../assets/font"),
    // "C:\\Users\\root\\Downloads\\f\\ttf",
    // "C:\\Users\\root\\Downloads\\f\\2",
    // "C:\\Users\\root\\Downloads\\f\\AidianSignatureTi-Regular",
    // "C:\\Users\\root\\Downloads\\f\\Inter-4.1\\extras",
    // "C:\\Users\\root\\Downloads\\f\\Magier Schrift",
  ]);

  toImageService["__node"] = node;
  return toImageService;
}
