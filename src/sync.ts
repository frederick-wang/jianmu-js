/**
 * Process:
 * JavaScript Raw Object -> Sync Object (JS) -> JSON String -> Python Raw Object
 */

type SyncObjectVersion = 1
type SyncObjectProtocol = 'jianmu-object-sync-protocol'
type SyncObjectSource = 'javascript'

type BaseSyncObject = {
  protocol: SyncObjectProtocol
  version: SyncObjectVersion
  source: 'javascript'
}

type SyncObjectType = 'File'

type SyncObjectDataFile = {
  lastModified: number
  name: string
  base64Src: string
  path: string
  size: number
  type: string
  webkitRelativePath: string
}

type SyncObject = BaseSyncObject & {
  type: 'File'
  data: SyncObjectDataFile
}

export type {
  SyncObject,
  SyncObjectDataFile,
  SyncObjectType,
  SyncObjectSource,
  SyncObjectVersion,
  SyncObjectProtocol
}

type JSONObject = { [member: string]: JSONValue }
type JSONArray = JSONValue[]
type JSONValue = string | number | boolean | null | JSONObject | JSONArray

type SupportJSObject = { [member: string]: SupportJSValue }
type SupportJSArray = SupportJSValue[]
type SupportJSValue = File | JSONValue | SupportJSObject | SupportJSArray

const fileProxyToFileWeakMap = new WeakMap<File, File>()

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
    reader.readAsDataURL(fileProxyToFileWeakMap.get(file) || file)
  })

const dataURItoBlob = (dataURI: string) => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length)

  // create a view into the buffer
  const ia = new Uint8Array(ab)

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString })
  return blob
}

const syncObjectToJsVersion1FileConverter = (obj: SyncObjectDataFile): File => {
  // obj.base64Src is a string like "data:application/pdf;base64,...".
  // We convert base64Src to Blob and then convert Blob to File.
  const blob = dataURItoBlob(obj.base64Src)
  const file = new File([blob], obj.name, {
    lastModified: obj.lastModified,
    type: obj.type
  })
  // return a proxy of file to add path and webkitRelativePath
  const fileProxy = new Proxy(file, {
    get: (target, name) => {
      if (name === 'path') {
        return obj.path
      }
      if (name === 'webkitRelativePath') {
        return obj.webkitRelativePath
      }
      return (target as any)[name]
    }
  })
  fileProxyToFileWeakMap.set(fileProxy, file)
  return fileProxy
}

const jsToSyncObjectVersion1 = async (
  obj: SupportJSValue
): Promise<JSONValue> => {
  if (typeof obj === 'object' && obj !== null) {
    const nonNullObjectObj = obj as Exclude<
      SupportJSValue,
      null | string | number | boolean
    >
    if (Array.isArray(nonNullObjectObj)) {
      const newArr = Promise.all(nonNullObjectObj.map(jsToSyncObjectVersion1))
      return newArr
    }
    const nonArrayObject = nonNullObjectObj as Exclude<
      typeof nonNullObjectObj,
      SupportJSArray
    >
    if (nonArrayObject instanceof File) {
      const syncObj: SyncObject = {
        protocol: 'jianmu-object-sync-protocol',
        version: 1,
        source: 'javascript',
        type: 'File',
        data: await jsToSyncObjectVersion1FileConverter(nonArrayObject)
      }
      return syncObj
    }
    const record = nonArrayObject as Exclude<typeof nonArrayObject, File>
    const newObj = {} as Record<string, JSONValue>
    for (const key in record) {
      newObj[key] = await jsToSyncObjectVersion1(record[key])
    }
    return newObj
  }
  const primitiveObj = obj as Exclude<
    SupportJSValue,
    File | SupportJSObject | SupportJSArray
  >
  return primitiveObj
}

const syncObjectToJsVersion1 = (obj: JSONValue): SupportJSValue => {
  if (typeof obj === 'object' && obj !== null) {
    const nonNullObjectObj = obj as Exclude<
      JSONValue,
      null | string | number | boolean
    >
    if (Array.isArray(nonNullObjectObj)) {
      const newArr = nonNullObjectObj.map(syncObjectToJsVersion1)
      return newArr
    }
    const nonArrayObject = nonNullObjectObj as Exclude<
      typeof nonNullObjectObj,
      JSONArray
    >
    if (
      nonArrayObject.protocol === 'jianmu-object-sync-protocol' &&
      nonArrayObject.version === 1 &&
      nonArrayObject.source === 'javascript'
    ) {
      const syncObj = nonArrayObject as SyncObject
      if (syncObj.type === 'File') {
        return syncObjectToJsVersion1FileConverter(syncObj.data)
      }
    }
    const record = nonArrayObject as Exclude<typeof nonArrayObject, SyncObject>
    const newObj = {} as Record<string, SupportJSValue>
    for (const key in record) {
      newObj[key] = syncObjectToJsVersion1(record[key])
    }
    return newObj
  }
  const primitiveObj = obj as Exclude<
    SupportJSValue,
    File | SupportJSObject | SupportJSArray
  >
  return primitiveObj
}

const jsToSyncObject = (obj: SupportJSValue): Promise<JSONValue> => {
  return jsToSyncObjectVersion1(obj)
}

const syncObjectToJs = (obj: JSONValue): SupportJSValue => {
  return syncObjectToJsVersion1(obj)
}

export { jsToSyncObject, syncObjectToJs }
