import { Schema } from "koishi";
import { EmojiType } from "./satori/emoji";

export interface Config {
  font: {
    logInfo: boolean;
    dir: string;
    defaultFamily: string[];
    satoriDefaultEmojiType: EmojiType;
  };
}

export const Config: Schema<Config> = Schema.object({
  font: Schema.object({
    _prompt: Schema.never(),
    logInfo: Schema.boolean().default(true),
    dir: Schema.path({
      filters: ["directory"],
    }),
    defaultFamily: Schema.array(String),
    satoriDefaultEmojiType: Schema.union([
      "twemoji",
      "openmoji",
      "blobmoji",
      "noto",
      "fluent",
      "fluentFlat",
    ]).default("twemoji"),
  }),
}).i18n(
  (!("," + Object.keys(process.env).join(",").toLowerCase()).includes(",koishi")
    ? () => ({})
    : () => ({
        "en-US": require("./locales/en-US")._config,
        "fr-FR": require("./locales/fr-FR")._config,
        "ja-JP": require("./locales/ja-JP")._config,
        "ko-KR": require("./locales/ko-KR")._config,
        "ru-RU": require("./locales/ru-RU")._config,
        "zh-CN": require("./locales/zh-CN")._config,
        "zh-TW": require("./locales/zh-TW")._config,
      }))(),
);
