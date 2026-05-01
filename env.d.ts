/// <reference types="vite/client" />

interface NativeBridgeMessage {
  type: string
  payload?: any
}

interface NativeBridge {
  send: (msg: NativeBridgeMessage) => void
  onMessage: ((msg: NativeBridgeMessage) => void) | null
}

interface Window {
  nativeBridge: NativeBridge
}
