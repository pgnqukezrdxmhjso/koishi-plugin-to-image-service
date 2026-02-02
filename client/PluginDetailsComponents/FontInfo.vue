<template>
  <el-popover
    :width="300"
    placement="bottom-end"
    trigger="click"
    :popper-class="$style['popover-container']"
    :teleported="false"
  >
    <template #reference>
      <el-badge :value="families?.length || 0" type="primary">
        <el-button>{{ t("fontInfo") }}</el-button>
      </el-badge>
    </template>
    <template #default>
      <el-scrollbar max-height="60vh">
        <el-collapse accordion>
          <el-collapse-item
            v-for="family in families"
            :key="family.family"
            :name="family.family"
          >
            <template #title>
              <div :class="$style['family-title']">
                <div :class="$style['family-info']">
                  <span>
                    <el-icon
                      v-if="isSupported"
                      color="#409efc"
                      :size="24"
                      :title="_t('copy.copyTitle')"
                      @click.stop="copy(family.family)"
                    >
                      <DocumentCopy />
                    </el-icon>
                    <span :class="$style['select-all']">{{
                      family.family
                    }}</span>
                  </span>
                  <span>
                    {{ propelSizeUnit(family.totalDataSize) }}
                  </span>
                </div>
                <img
                  v-if="previewMap?.[family.family]"
                  :src="previewMap[family.family]"
                />
              </div>
            </template>
            <div
              v-for="member in family.members"
              :key="member.name"
              :class="$style['font-info']"
            >
              <el-divider border-style="dashed" />
              <div :class="$style['family-info']">
                <span>
                  {{ member.name }}
                </span>
                <span>
                  {{ propelSizeUnit(member.dataSize) }}
                </span>
              </div>
              <div :class="$style['font-tag']">
                <el-tag type="primary" effect="plain" size="small">
                  {{ member.format }}
                </el-tag>
                <el-tag type="primary" effect="plain" size="small">
                  {{ member.weight }}
                </el-tag>
                <el-tag
                  v-if="member.italic"
                  type="primary"
                  effect="plain"
                  size="small"
                >
                  {{ t("italic") }}
                </el-tag>
                <el-tag
                  v-if="member.variable"
                  type="primary"
                  effect="plain"
                  size="small"
                >
                  {{ t("variable") }}
                </el-tag>
                <el-tag
                  v-if="Number.isInteger(member.colrVer)"
                  type="primary"
                  effect="plain"
                  size="small"
                >
                  {{ "COLRv" + member.colrVer }}
                </el-tag>
              </div>
              <div>
                {{ t("characterCount", member.characterCount) }}
              </div>
              <div>
                {{ t("ligatureCount", member.ligatureCount) }}
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, inject, watch } from "vue";
import { ComposerTranslation } from "vue-i18n";
import { useClipboard, useDebounceFn } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { DocumentCopy } from "@element-plus/icons-vue";

import { send, receive } from "@koishijs/client";
import type { FontManagement } from "../../src";
import { Events } from "@koishijs/plugin-console";

const _t = inject<ComposerTranslation>("t");
const t = (p: string, ...a: any[]) => _t.apply(_t, ["FontInfo." + p, a]);

const families = ref<FontManagement.Family[]>();
let needGetAllFamily = true;
const getAllFamily = async () => {
  if (!needGetAllFamily) {
    return;
  }
  needGetAllFamily = false;
  try {
    families.value = (await send("to-image-service-get-all-family")) || [];
    await fontPreview();
  } finally {
    getAllFamily().then();
  }
};
const previewMap =
  ref<Awaited<ReturnType<Events["to-image-service-font-preview"]>>>();
const fontPreview = async () => {
  previewMap.value = {};
  const previewList = families.value.map((family) => {
    return {
      content: family.family.toLowerCase().includes("emoji")
        ? "😄🥔👨‍👩‍👧‍👦"
        : t("previewContent"),
      familyName: family.family,
    };
  });
  previewMap.value = await send(
    "to-image-service-font-preview",
    previewList,
    26,
  );
};
getAllFamily();
receive(
  "to-image-service-get-all-family-refresh",
  useDebounceFn(() => {
    needGetAllFamily = true;
    getAllFamily();
  }, 500),
);

const propelSizeUnit = (size = 0, unit = 0) => {
  if (size <= 1024 || unit >= 5) {
    return +size.toFixed(2) + ["", "K", "M", "G", "T", "P"][unit] + "B";
  }
  return propelSizeUnit(size / 1024, unit + 1);
};

const { copy, copied, isSupported } = useClipboard({
  legacy: true,
});
watch(copied, (val) => {
  if (val) ElMessage.success(_t("copy.success"));
});
</script>

<style module lang="scss">
.popover-container {
  overflow: hidden;
  --el-popover-padding: 0;

  :global(.el-collapse-item__header) {
    padding: 10px 0 10px 5px;
    height: auto;
    line-height: 1;
  }
  :global(.el-collapse-item__content) {
    padding-bottom: 5px;
  }
  .family-title {
    width: 100%;
    text-align: end;
  }
  .family-info {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    * {
      text-align: start;
      vertical-align: middle;
    }
    .select-all {
      user-select: all;
    }
  }
  .font-info {
    padding: 0 15px 5px;

    :global(.el-divider--horizontal) {
      margin: 0;
    }
    .font-tag {
      display: flex;
      gap: 0 5px;
    }
  }
}
</style>
