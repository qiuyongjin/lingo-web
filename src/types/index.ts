export interface Target {
  word: string
  line: number
  wordIndex: number
  translate: string
}

export interface ExtractTitle {
  title: string[] | null
  body: string[][]
}

export type ExtractTitleKey = 'title' | 'body'

export interface SentMessageData {
  action: string
  data: object
}

export interface ClickData {
  word: string
  line: number
  wordIndex: number
  titleOrBody: ExtractTitleKey
}
