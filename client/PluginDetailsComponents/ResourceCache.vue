<template>
  <el-popover
    :width="300"
    placement="bottom-end"
    trigger="click"
    :popper-class="$style['popover-container']"
    :teleported="false"
  >
    <template #reference>
      <el-button>{{ percentage }}</el-button>
    </template>
    <template #default>
      <el-descriptions
        :title="t('smallPool')"
        class="margin-top"
        :column="1"
        border
      >
        <template #extra>
          <el-button
            @click="clear({ small: true })"
            :icon="Delete"
            size="small"
            circle
          />
        </template>
        <el-descriptions-item>
          <template #label>
            {{ t("item") }}
          </template>
          {{ poolInfo.smallSize }}
          /
          {{ poolInfo.cacheConfig?.smallPoolMaxItem }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            {{ t("size") }}
          </template>
          {{ propelSizeUnit(poolInfo.smallCalculatedSize) }}
        </el-descriptions-item>
      </el-descriptions>
      <br />
      <el-descriptions
        :title="t('largePool')"
        class="margin-top"
        :column="1"
        border
      >
        <template #extra>
          <el-button
            @click="clear({ large: true })"
            :icon="Delete"
            size="small"
            circle
          />
        </template>
        <el-descriptions-item>
          <template #label>
            {{ t("item") }}
          </template>
          {{ poolInfo.largeSize }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            {{ t("size") }}
          </template>
          {{ propelSizeUnit(poolInfo.largeCalculatedSize) }}
          /
          {{ propelSizeUnit(poolInfo.cacheConfig?.largePoolMaxSize) }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { inject, ref, computed, onUnmounted } from "vue";
import { ComposerTranslation } from "vue-i18n";
import { Delete } from "@element-plus/icons-vue";

import { send } from "@koishijs/client";
import type { Events } from "@koishijs/console";
import { propelSizeUnit } from "../util";

const _t = inject<ComposerTranslation>("t");
const t = (p: string, ...a: any[]) => _t.apply(_t, ["ResourceCache." + p, a]);

const poolInfo = ref<
  ReturnType<Events["to-image-service-resource-cache-pool-info"]>
>({} as any);
const loading = ref<boolean>(false);
const loadPoolInfo = async () => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  try {
    poolInfo.value = await send("to-image-service-resource-cache-pool-info");
  } finally {
    loading.value = false;
  }
};

const clear = ({ small = false, large = false }) => {
  send("to-image-service-resource-cache-clear", { small, large });
  loadPoolInfo();
};

const percentage = computed(() => {
  const info = poolInfo.value;
  if (!info) {
    return "- -";
  }

  let t = "";

  if (info.cacheConfig?.smallPoolMaxItem) {
    t +=
      parseInt(
        ((info.smallSize / info.cacheConfig.smallPoolMaxItem) * 100).toFixed(2),
        10,
      ) + "%";
  } else {
    t += "-";
  }
  t += " ";
  if (info.cacheConfig?.largePoolMaxSize) {
    t +=
      parseInt(
        (
          (info.largeCalculatedSize / info.cacheConfig.largePoolMaxSize) *
          100
        ).toFixed(2),
        10,
      ) + "%";
  } else {
    t += "-";
  }
  return t;
});

loadPoolInfo();
const interval = setInterval(() => {
  loadPoolInfo();
}, 500);

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style module lang="scss">
.popover-container {
  :global(.el-descriptions__label) {
    width: 100px;
  }
}
</style>
