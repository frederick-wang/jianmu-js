import JianmuBaseAPI from './JianmuBaseAPI'

export {}

declare global {
  interface Window {
    api: JianmuBaseAPI
  }
}
