import path from "node:path";

// noinspection ES6UnusedImports
import {} from "@koishijs/plugin-console";
import { BeanHelper } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import { Config } from "./config";
import { FontManagement } from "./fontManagement";

declare module "@koishijs/plugin-console" {
  interface Events {
    "to-image-service-get-all-family"(): FontManagement.Family[];
  }
}

export default class Console extends BeanHelper.BeanType<Config> {
  private fontManagement = this.beanHelper.instance(FontManagement);

  constructor(beanHelper: BeanHelper<Config>) {
    super(beanHelper);

    this.ctx.inject(["console"], (ctx) => {
      ctx.console.addListener("to-image-service-get-all-family", () =>
        this.fontManagement.getAllFamily(true),
      );

      ctx.console.addEntry({
        dev: path.resolve(__dirname, "../client/index.ts"),
        prod: path.resolve(__dirname, "../dist"),
      });
    });
  }
}
