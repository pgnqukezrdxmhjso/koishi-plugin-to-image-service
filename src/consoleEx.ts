import path from "node:path";

// noinspection ES6UnusedImports
import {} from "@koishijs/plugin-console";
import { BeanHelper } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import { Config } from "./config";
import { FontManagement } from "./fontManagement";
import { TakumiRenderer } from "./toImage";
import { toReactElement } from "./toReactElement";

declare module "@koishijs/plugin-console" {
  interface Events {
    "to-image-service-get-all-family"(): FontManagement.Family[];
    "to-image-service-font-preview": (
      ...args: Parameters<(typeof ConsoleEx.prototype)["fontPreview"]>
    ) => Promise<Record<string, string>>;
  }
}

export default class ConsoleEx extends BeanHelper.BeanType<Config> {
  private fontManagement = this.beanHelper.instance(FontManagement);
  private takumiRenderer = this.beanHelper.instance(TakumiRenderer);

  start() {
    this.ctx.inject(["console"], (ctx) => {
      ctx.console.addListener("to-image-service-get-all-family", () =>
        this.fontManagement.getAllFamily(true),
      );

      ctx.console.addListener(
        "to-image-service-font-preview",
        async (previewList, fontSize) =>
          Object.fromEntries(
            Object.entries(await this.fontPreview(previewList, fontSize)).map(
              (e) => [
                e[0],
                "data:image/png;base64," + Buffer.from(e[1]).toString("base64"),
              ],
            ),
          ),
      );

      this.fontManagement.eventEmitter.on("fontChange", () =>
        ctx.console.broadcast("to-image-service-get-all-family-refresh", ""),
      );

      let prod = path.resolve(__dirname, "../dist");
      if (prod.includes("external") && !prod.includes("node_modules")) {
        prod = path.join(
          ctx.baseDir,
          "node_modules/koishi-plugin-to-image-service/dist",
        );
      }
      ctx.console.addEntry({
        dev: path.resolve(__dirname, "../client/index.ts"),
        prod,
      });
    });
  }

  async fontPreview(
    previewList: { content: string; familyName: string }[],
    fontSize: number = 32,
  ) {
    const imgMap: Record<string, Uint8Array> = {};
    for (const preview of previewList) {
      const html = `<div style="font-size: ${fontSize}px;font-family: ${preview.familyName}">${preview.content}</div>`;
      imgMap[preview.familyName] = await this.takumiRenderer.render({
        reactElement: toReactElement.htmlToReactElement(html),
      });
    }
    return imgMap;
  }
}
