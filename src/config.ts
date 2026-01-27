import { Schema } from "koishi";

export interface Config {
  font: {
    logInfo: boolean;
    dir: string;
    defaultFamily: string;
  };
}

export const Config: Schema<Config> = Schema.object({
  font: Schema.object({
    _prompt: Schema.never(),
    logInfo: Schema.boolean().default(true),
    dir: Schema.path({
      filters: ["directory"],
    }),
    defaultFamily: Schema.string(),
  }),
}).i18n({
  "en-US": require("./locales/en-US")._config,
  "fr-FR": require("./locales/fr-FR")._config,
  "ja-JP": require("./locales/ja-JP")._config,
  "ko-KO": require("./locales/ko-KO")._config,
  "ru-RU": require("./locales/ru-RU")._config,
  "zh-CN": require("./locales/zh-CN")._config,
  "zh-TW": require("./locales/zh-TW")._config,
});
