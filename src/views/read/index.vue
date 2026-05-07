<script setup lang="ts">
import type { ClickData } from '@/types'
import { onMounted, onUnmounted, ref } from 'vue'
import { initWordBoundaryExpand } from '@/utils/word-boundary-expand'
import { handleGetSelection, sentences, target, useSentence } from '@/views/read/index.ts'

let timer: number | null = null
const delay = 250 // 毫秒内第二次点击算双击

const speakingWord = ref({
  line: 0,
  wordIndex: 0,
  word: '',
  titleOrBody: '',
})

function handleClick(data: ClickData) {
  const { word, line, wordIndex, titleOrBody } = data
  speakingWord.value = {
    line,
    wordIndex,
    word,
    titleOrBody,
  }
  if (timer) {
    clearTimeout(timer)
    timer = null
    onDoubleClick(data)
  }
  else {
    timer = setTimeout(() => {
      onSingleClick(data)
      timer = null
    }, delay)
  }
}

function onSingleClick(e: ClickData) {
  const { word, line, wordIndex, titleOrBody } = e
  const title: string[] = Object.assign([], useSentence.value.title)
  const body: string[] = Object.assign([], useSentence.value.body[line])
  let sentence: string[]

  if (titleOrBody === 'title') {
    title[wordIndex] = `{${word}}`
    sentence = title
  }
  else {
    body[wordIndex] = `{${word}}`
    sentence = body
  }

  const data = {
    type: 'clickWord',
    payload: {
      ...e,
      sentence: sentence.join(' ').replace(/ , /g, ', '),
    },
  }
  if (window.nativeBridge) {
    window.nativeBridge.send(data)
  }
}

function onDoubleClick(e: ClickData) {
  const data = handleGetSelection(e)
  window.nativeBridge.send({ type: 'annotation', payload: data })
}

function handleActivate(word: any, line: number, wordIndex: number, titleOrBody: string): any {
  return target.value.find((v) => {
    const region = v.titleOrBody === titleOrBody
    const i = v.line === line && v.wordIndex === wordIndex
    return region && i
  })
}
function handleSpankWord(wordStr: any, index1: any, index2: any) {
  const { line, wordIndex, word } = speakingWord.value
  return line === index1 && wordIndex === index2 && word === wordStr
}
function playSentence(index: number) {
  window.nativeBridge.send({ type: 'playSentence', payload: { sentence: sentences.value[index] } })
}
let cleanupExpand: (() => void) | null = null

onMounted(() => {
  cleanupExpand = initWordBoundaryExpand()
})

onUnmounted(() => {
  cleanupExpand?.()
  cleanupExpand = null
})
</script>

<template>
  <div class="page">
    <div v-if="useSentence.title?.length" class="paragraph title">
      <template v-for="(word, index) in useSentence.title" :key="word">
        <span
          :class="{ target: handleActivate(word, 0, index, 'title') }"
          @click="handleClick({ word, line: 0, wordIndex: index, titleOrBody: 'title' })"
        >
          {{ word }}
          <small v-if="handleActivate(word, 0, index, 'title')">
            {{ handleActivate(word, 0, index, 'title').translate }}
          </small>
        </span>
      </template>
      <span class="play-btn" @click="playSentence(0)">
        <img width="18" src="../../assets/play.svg" alt="play">
      </span>
    </div>
    <template v-for="(line, index) in useSentence.body" :key="index">
      <div class="paragraph body">
        <template v-for="(word, index2) in line" :key="index2">
          <span
            class="word"
            :class="{ target: handleActivate(word, index, index2, 'body'), speaking: handleSpankWord(word, index, index2) }"
            data-type="body"
            :data-line="index"
            :data-word_index="index2"
            @click="handleClick({ word, line: index, wordIndex: index2, titleOrBody: 'body' })"
          >
            {{ word }}
            <small
              v-if="handleActivate(word, index, index2, 'body')"
              class="word-answer"
            >
              {{ handleActivate(word, index, index2, 'body').translate }}
            </small>
          </span>
        </template>
        <span v-if="line.length" class="play-btn" @click="playSentence(index + 1)">
          <img width="12" src="../../assets/play.svg" alt="play">
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.test-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

div {
  color: white;
  font-size: 21px;
  line-height: 32px;
}

.title {
  font-size: 34px !important;
  line-height: 40px !important;
  font-weight: bold;
}

.body {
  color: #c3c3c3;
}

.target {
  display: flex;
}

.speaking {
  color: #fff;
  text-decoration: underline;
}

.title,
.target {
  color: rgb(255, 141, 40);
}

.play-btn {
  color: #c3c3c3;
}

.paragraph {
  font-size: 0;
  word-break: break-word;
}

.word {
  word-break: break-word;
  font-size: 21px;
  line-height: 32px;
}
</style>
