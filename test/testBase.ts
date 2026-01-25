import WNode from "koishi-plugin-w-node";
import path from "node:path";
import ToImageService from "../src";

export async function loadService() {
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
    },
  };
  const node = new WNode(ctx as any, {
    packagePath: path.resolve(__dirname, "../../../cache/node"),
    registry: "https://registry.npmmirror.com/",
  });
  await node.start();

  const toImageService = new ToImageService({ ...ctx, node } as any, {} as any);
  await toImageService.start();
  await toImageService.fontManagement.loadFontDir([
    // path.resolve("../../to-image-service-font-jetbrains-mono"),
    // path.resolve("../../to-image-service-font-source-han-mono-sc"),
    // "C:\\Users\\root\\Downloads\\f\\ttf",
    // "C:\\Users\\root\\Downloads\\f\\2",
    // "C:\\Users\\root\\Downloads\\f\\AidianSignatureTi-Regular",
    // "C:\\Users\\root\\Downloads\\f\\Inter-4.1\\extras",
    // "C:\\Users\\root\\Downloads\\f\\Magier Schrift",
  ]);

  return toImageService;
}
