import JMFile from './JMFile'
import { SyncObjectDataFile } from './types'
import { dataURItoBlob } from './utils'

const syncObjectToJsVersion1FileConverter = (obj: SyncObjectDataFile): File => {
  // obj.base64Src is a string like "data:application/pdf;base64,...".
  // We convert base64Src to Blob and then convert Blob to File.
  const blob = dataURItoBlob(obj.base64Src)
  return new JMFile([blob], obj.name, {
    lastModified: obj.lastModified,
    type: obj.type,
    path: obj.path,
    webkitRelativePath: obj.webkitRelativePath
  })
}

const jsToSyncObjectVersion1FileConverter = (
  file: File
): Promise<SyncObjectDataFile> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        lastModified: file.lastModified,
        name: file.name,
        base64Src: reader.result as string,
        path: file.path,
        size: file.size,
        type: file.type,
        webkitRelativePath: file.webkitRelativePath
      })
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })

export {
  syncObjectToJsVersion1FileConverter,
  jsToSyncObjectVersion1FileConverter
}
