<template>
  <PluginDetails v-if="isOwn" />
</template>
<script setup lang="ts">
import { ComputedRef, inject, ref, provide } from "vue";
import { useI18n } from "vue-i18n";
import packageJson from "../package.json";
import PluginDetails from "./PluginDetailsComponents/PluginDetails.vue";
import enUs from "./locales/en-US.yml";
import frFr from "./locales/fr-FR.yml";
import jaJp from "./locales/ja-JP.yml";
import koKo from "./locales/ko-KO.yml";
import ruRu from "./locales/ru-RU.yml";
import zhCn from "./locales/zh-CN.yml";
import zhTw from "./locales/zh-TW.yml";

const pluginName = inject<ComputedRef<string>>("plugin:name");
const isOwn = ref(pluginName.value === packageJson.name);

const { t } = useI18n({
  messages: {
    "en-US": enUs,
    "fr-FR": frFr,
    "ja-JP": jaJp,
    "ko-KO": koKo,
    "ru-RU": ruRu,
    "zh-CN": zhCn,
    "zh-TW": zhTw,
  },
});

provide("t", t);
</script>
<style scoped lang="scss"></style>
