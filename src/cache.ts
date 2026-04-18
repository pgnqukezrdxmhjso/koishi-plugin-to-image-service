import { Awaitable } from "koishi";
import { BeanHelper, Locks } from "koishi-plugin-rzgtboeyndxsklmq-commons";

import { LRUCache } from "lru-cache";

import { Config, ResourceCacheConfig } from "./config";

export class ResourceCache extends BeanHelper.BeanType<Config> {
  private small: LRUCache<string, ArrayBuffer>;
  private large: LRUCache<string, ArrayBuffer>;

  private defaultConfig: ResourceCacheConfig = {
    smallPoolMaxItem: 500,
    smallPoolMaxEntrySize: 0.25,
    smallPoolTtl: 1440,
    largePoolMaxSize: 100,
    largePoolMaxEntrySize: 10,
    largePoolTtl: 30,
  };

  private cacheConfig: ResourceCacheConfig;

  start(): Awaitable<void> {
    const config = (this.cacheConfig = Object.assign(
      {},
      this.defaultConfig,
      this.config?.cache?.resource,
    ));

    config.smallPoolMaxEntrySize = config.smallPoolMaxEntrySize * 1024 * 1024;
    config.smallPoolTtl = config.smallPoolTtl * 60 * 1000;

    config.largePoolMaxSize = config.largePoolMaxSize * 1024 * 1024;
    config.largePoolMaxEntrySize = config.largePoolMaxEntrySize * 1024 * 1024;
    config.largePoolTtl = config.largePoolTtl * 60 * 1000;

    for (const k in config) {
      config[k] = Math.trunc(config[k]);
    }

    if (config?.smallPoolMaxItem) {
      this.small = new LRUCache({
        max: config.smallPoolMaxItem,
        maxEntrySize: config.smallPoolMaxEntrySize,
        ttl: config.smallPoolTtl,
        ttlAutopurge: true,
        updateAgeOnGet: true,
      });
    }

    if (config?.largePoolMaxSize) {
      this.large = new LRUCache({
        maxSize: config.largePoolMaxSize,
        maxEntrySize: config.largePoolMaxEntrySize,
        ttl: config.largePoolTtl,
        ttlAutopurge: true,
        updateAgeOnGet: true,
      });
    }
  }

  destroy() {
    this.small?.clear();
    this.large?.clear();
  }

  poolInfo() {
    return {
      cacheConfig: this.cacheConfig,
      smallSize: this.small?.size,
      smallCalculatedSize: this.small?.calculatedSize,
      largeSize: this.large?.size,
      largeCalculatedSize: this.large?.calculatedSize,
    };
  }

  clear({ small, large }: { small: boolean; large: boolean }) {
    if (small) {
      this.small?.clear();
    }
    if (large) {
      this.large?.clear();
    }
  }

  has(key: string) {
    return this.small?.has(key) || this.large?.has(key);
  }

  get(key: string) {
    return this.small?.get(key) || this.large?.get(key);
  }

  set(key: string, value: ArrayBuffer) {
    if (value.byteLength <= this.cacheConfig.smallPoolMaxEntrySize) {
      this.small?.set(key, value, { size: value.byteLength || 1 });
    } else if (value.byteLength <= this.cacheConfig.largePoolMaxEntrySize) {
      this.large?.set(key, value, { size: value.byteLength });
    }
  }

  async fetch(
    url: string,
    {
      key = url,
      defaultValue,
    }: {
      key?: string;
      defaultValue?: ArrayBuffer;
    } = {} as any,
  ) {
    let v = this.get(key);
    if (v) {
      return v;
    }

    await Locks.coalesce(`fetchLock-${url}`, async () => {
      try {
        v = await this.ctx.http.get(url, {
          headers: { Referer: new URL(url).origin },
          responseType: "arraybuffer",
        });
        this.set(key, v);
      } catch (e) {
        if (!defaultValue) {
          throw e;
        }
        if (this.config?.logInfo) {
          this.ctx.logger.error(url, e);
        }
        v = defaultValue;
        this.set(key, v);
      }
    });

    return v;
  }
}
