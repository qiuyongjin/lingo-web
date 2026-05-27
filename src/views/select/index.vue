<template>
  <div class="select-page">
    <article class="article-content" ref="articleRef">
      <p v-for="(paragraph, index) in paragraphs" :key="index" v-html="paragraph"></p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const articleRef = ref<HTMLElement | null>(null)

// 示例文章内容
const sampleText = `这是一段示例文字，用于测试滑动选择功能。用户可以通过手指在屏幕上滑动来选中这段文字中的任意部分。选中的文字会以高亮方式显示，方便用户标记重要内容。

这是一个较长的段落，包含了足够多的文字内容，以便在移动设备上进行滑动选择操作。选中后的内容会以黄色背景高亮显示。

你可以尝试选中这段文字，或者选中其他段落中的部分内容。每一处高亮都会独立保存，可以同时存在多个高亮区域。刷新页面后高亮会消失，因为数据仅保存在内存中。`

const paragraphs = computed(() => {
  return sampleText.split('\n\n').filter(p => p.trim())
})
</script>

<style scoped>
.select-page {
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
  background: #fff;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.article-content p {
  margin-bottom: 16px;
}

.article-content mark {
  background-color: #fff3cd;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
