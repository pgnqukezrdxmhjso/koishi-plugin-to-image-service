import { Schema } from "koishi";
import path from "node:path";

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
  "en-US": require(path.join(__dirname, "./locales/en-US"))._config,
  "fr-FR": require(path.join(__dirname, "./locales/fr-FR"))._config,
  "ja-JP": require(path.join(__dirname, "./locales/ja-JP"))._config,
  "ko-KO": require(path.join(__dirname, "./locales/ko-KO"))._config,
  "ru-RU": require(path.join(__dirname, "./locales/ru-RU"))._config,
  "zh-CN": require(path.join(__dirname, "./locales/zh-CN"))._config,
  "zh-TW": require(path.join(__dirname, "./locales/zh-TW"))._config,
});
