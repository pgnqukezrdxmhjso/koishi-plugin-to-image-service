<template>
  <el-button @click="test" :loading="underTest">
    {{ underTest ? "" : t("test") }}
  </el-button>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { ComposerTranslation } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { send } from "@koishijs/client";

const _t = inject<ComposerTranslation>("t");
const t = (p: string, ...a: any[]) => _t.apply(_t, ["CDNNodeSpeed." + p, a]);

const underTest = ref<boolean>(false);
const test = async () => {
  if (underTest.value) {
    return;
  }
  underTest.value = true;
  try {
    const nodeSpeeds = await send("to-image-service-cdn-node-speed");
    ElMessageBox.alert(
      "<table style='width: 100%'>" +
        nodeSpeeds
          .sort((a, b) => (a.duration ?? 999999999) - (b.duration ?? 999999999))
          .map(
            (ns) =>
              `<tr><td>${ns.node}</td><td>${ns.duration ?? "x"} ms</td></tr>`,
          )
          .join("") +
        "</table>",
      "",
      {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        center: true,
      },
    ).then();
  } finally {
    underTest.value = false;
  }
};
</script>

<style scoped lang="scss"></style>
