<script setup lang="ts">
import { nextTick } from 'vue'
import { sentence, target, updateHeight } from '@/views/reading'

function wrapSelectionWithBraces() {
  const selection = window.getSelection()

  // 没有选中或只是光标状态，直接返回
  if (!selection || selection.isCollapsed) {
    return null
  }

  const anchorNode = selection.anchorNode
  const focusNode = selection.focusNode

  if (!anchorNode || !focusNode) {
    return null
  }

  // 只处理选中内容在同一个文本节点内的简单情况
  if (anchorNode !== focusNode || anchorNode.nodeType !== Node.TEXT_NODE) {
    console.warn('选区跨节点或不在文本节点中，请使用更复杂的 Range 操作')
    return null
  }

  const fullText = anchorNode.textContent
  if (fullText === null) {
    return null
  }
  const startOffset = Math.min(selection.anchorOffset, selection.focusOffset)
  const endOffset = Math.max(selection.anchorOffset, selection.focusOffset)

  // 拼接新内容
  const before = fullText.slice(0, startOffset)
  const selected = fullText.slice(startOffset, endOffset)
  const after = fullText.slice(endOffset)

  return `${before}{${selected}}${after}`
}

window.wrapSelectionWithBraces = wrapSelectionWithBraces

function init() {
  if (!window.nativeBridge)
    return

  window.nativeBridge.onMessage = (msg: any) => {
    const { type, payload } = msg
    if (type === 'annotation') {
      const targetIndex = target.value.findIndex((v: any) => {
        const index = v.line === payload.line && v.wordIndex === payload.wordIndex
        const titleOrBody = v.titleOrBody === payload.titleOrBody
        return index && titleOrBody
      })
      if (targetIndex > -1) {
        target.value[targetIndex] = payload
      }
      else {
        target.value.push(payload)
      }
      updateHeight()
      return
    }
    if (type === 'setContent') {
      sentence.value = payload.data
      // window.nativeBridge.send({ type: 'debug', payload: { data: sentence.value } })
      nextTick(() => {
        updateHeight()
      })
    }
  }
}

window.onload = () => {
  init()
}
</script>

<template>
  <router-view />
</template>

<style scoped>

</style>
