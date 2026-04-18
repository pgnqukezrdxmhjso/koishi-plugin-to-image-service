import { Schema } from "koishi";
import { SatoriRenderer } from "./toSvg";
import { CDNNodes, CDNNode } from "./util";

export interface ResourceCacheConfig{
  smallPoolMaxItem: number;
  smallPoolMaxEntrySize: number;
  smallPoolTtl: number;
  largePoolMaxSize: number;
  largePoolMaxEntrySize: number;
  largePoolTtl: number;
}

export interface Config {
  logInfo: boolean;
  font: {
    dir: string;
    defaultFamily: string[];
    defaultEmojiType: SatoriRenderer.EmojiType;
    takumiUseFontEmoji: boolean;
    CDNNode: CDNNode;
  };
  cache: {
    resource: ResourceCacheConfig;
  };
}

export const Config: Schema<Config> = Schema.object({
  logInfo: Schema.boolean().default(false),
  font: Schema.object({
    _prompt: Schema.never(),
    dir: Schema.path({
      filters: ["directory"],
    }),
    defaultFamily: Schema.array(String),
    defaultEmojiType: Schema.union(
      Object.keys(SatoriRenderer.emojiApis) as SatoriRenderer.EmojiType[],
    ).default(
      Object.keys(SatoriRenderer.emojiApis)[0] as SatoriRenderer.EmojiType,
    ),
    takumiUseFontEmoji: Schema.boolean().default(true),
    CDNNode: Schema.union(Object.keys(CDNNodes) as CDNNode[]).default(
      Object.keys(CDNNodes)[0] as CDNNode,
    ),
  }),
  cache: Schema.object({
    resource: Schema.object({
      _prompt: Schema.never(),
      smallPoolMaxItem: Schema.number().min(0).default(500),
      smallPoolMaxEntrySize: Schema.number().min(0).default(0.25),
      smallPoolTtl: Schema.number().min(0).default(1440),
      largePoolMaxSize: Schema.number().min(0).default(100),
      largePoolMaxEntrySize: Schema.number().min(0).default(10),
      largePoolTtl: Schema.number().min(0).default(30),
    }),
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
