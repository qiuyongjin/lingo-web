export {} // Make the file an ES module

declare global {
  interface Window {
    nativeBridge: any // Replace 'any' with a more specific type if possible
  }
}
