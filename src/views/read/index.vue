<script setup lang="ts">
import type { ClickData } from '@/types'
import { onMounted, ref } from 'vue'
import { matchPunctuation, sentMessage } from '@/utils'
import { handleGetSelection, target, updateHeight, useSentence } from '@/views/read/index.ts'

let timer: number | null = null
const delay = 250 // 毫秒内第二次点击算双击

const speakingWord = ref({
  line: 0,
  wordIndex: 0,
  word: '',
})

function handleClick(data: ClickData) {
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
  console.log('单击事件', word)
  speakingWord.value = {
    line,
    wordIndex,
    word,
  }
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
      word,
      sentence: sentence.join(' ').replace(/ , /g, ', '),
    },
  }
  sentMessage(data)
}

function onDoubleClick(e: ClickData) {
  const data = handleGetSelection(e)
  sentMessage({ action: 'annotation', data })
}

function handleActivate(word: any): any {
  return target.value.find((v: any) => word.toLowerCase() === v.word.toLowerCase())
}
function handleSpankWord(wordStr: any, index1: any, index2: any) {
  const { line, wordIndex, word } = speakingWord.value
  return line === index1 && wordIndex === index2 && word === wordStr
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
    <div class="paragraph title">
      <template v-for="(word, index) in useSentence.title" :key="word">
        <span v-if="!matchPunctuation(word)" :class="{ target: handleActivate(word) }" @click="handleClick({ word, line: 0, wordIndex: index, titleOrBody: 'title' })">
          {{ word }}
          <small v-if="handleActivate(word)">{{ handleActivate(word).translate }}</small>
        </span>
        <span v-else style="margin-left: -6px;">{{ word }}</span>
      </template>
    </div>
    <template v-for="(line, index) in useSentence.body" :key="index">
      <div class="paragraph body">
        <template v-for="(word, index2) in line" :key="word">
          <span
            v-if="!matchPunctuation(word)"
            class="word"
            :class="{ target: handleActivate(word), speaking: handleSpankWord(word, index, index2) }"
            data-type="body"
            :data-line="index"
            :data-word_index="index2"
            @click="handleClick({ word, line: index, wordIndex: index2, titleOrBody: 'body' })"
          >
            {{ word }}
            <small v-if="handleActivate(word)" class="word-answer">{{ handleActivate(word).translate }}</small>
          </span>
          <span v-else style="margin-left: -6px;">{{ word }}</span>
        </template>
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
  font-size: 20px;
  line-height: 32px;
}

.title {
  font-size: 34px;
  line-height: 40px;
  font-weight: bold;
}

.body {
  color: #ccc;
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
  column-gap: 6px;
}

.word {
  display: flex;
  align-items: baseline;
}
</style>
