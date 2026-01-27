<template>
  <DragContainer>
    <template #title>
      <div :class="$style.title">
        <ruby>toImage<rt>Service</rt></ruby>
      </div>
    </template>
    <FontInfo />
  </DragContainer>
</template>

<script setup lang="ts">
import DragContainer from "koishi-plugin-rzgtboeyndxsklmq-commons/vue/components/DragContainer.vue";
import FontInfo from "./FontInfo.vue";
</script>

<style module lang="scss">
.title {
  flex: 1;
  display: inline-block;
  font-size: 16px;
  text-align: center;
  rt {
    text-align: end;
  }
}
</style>
