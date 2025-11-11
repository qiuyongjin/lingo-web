<script setup lang="ts">
import type { ClickData } from '@/types'
import { onMounted, ref } from 'vue'
import { matchPunctuation, sentMessage } from '@/utils'
import { handleGetSelection, sentences, target, updateHeight, useSentence } from '@/views/read/index.ts'

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
  const t = Object.assign([], useSentence.value.title)
  const b: string[] = Object.assign([], useSentence.value.body[line])
  let sentence: string[]
  if (titleOrBody === 'title') {
    sentence = t
  }
  else {
    sentence = b
  }
  b[wordIndex] = `{${word}}`
  const data = {
    action: 'clickWord',
    data: {
      ...e,
      sentence: sentence.join(' ').replace(/ , /g, ', '),
    },
  }
  sentMessage(data)
}

function onDoubleClick(e: ClickData) {
  const data = handleGetSelection(e)
  sentMessage({ action: 'annotation', data })
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
  sentMessage({ action: 'playSentence', data: { sentence: sentences.value[index] } })
}
onMounted(() => {
//   sentence.value = `Test
// We had a picnic on the bank of the river.
// He broke the record in the 100-meter race.
// The news broke yesterday.`
  updateHeight(300)
})
</script>

<template>
  <div class="page">
    <div v-if="useSentence.title?.length" class="paragraph title">
      <template v-for="(word, index) in useSentence.title" :key="word">
        <span
          v-if="!matchPunctuation(word)"
          :class="{ target: handleActivate(word, 0, index, 'title') }"
          @click="handleClick({ word, line: 0, wordIndex: index, titleOrBody: 'title' })"
        >
          {{ word }}
          <small v-if="handleActivate(word, 0, index, 'title')">
            {{ handleActivate(word, 0, index, 'title').translate }}
          </small>
        </span>
        <span v-else style="margin-left: -6px;">{{ word }}</span>
      </template>
      <span class="play-btn" @click="playSentence(0)">
        <img width="18" src="../../assets/play.svg" alt="play">
      </span>
    </div>
    <template v-for="(line, index) in useSentence.body" :key="index">
      <div class="paragraph body">
        <template v-for="(word, index2) in line" :key="word">
          <span
            v-if="!matchPunctuation(word)"
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
          <span v-else style="margin-left: -6px;">{{ word }}</span>
        </template>
        <span v-if="line.length" class="play-btn" @click="playSentence(index + 1)">
          <img width="12" src="../../assets/play.svg" alt="play">
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
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
  font-size: 34px;
  line-height: 40px;
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

.paragraph {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.25em;
}

.word {
  display: flex;
  align-items: baseline;
}
.play-btn {
  color: #c3c3c3;
}
</style>
