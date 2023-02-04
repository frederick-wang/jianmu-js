/**
 * Process:
 * JavaScript Raw Object -> Sync Object (JS) -> JSON String -> Python Raw Object
 */

import {
  jsToSyncObjectVersion1FileConverter,
  syncObjectToJsVersion1FileConverter
} from './converter'
import {
  JSONArray,
  JSONValue,
  SupportJSArray,
  SupportJSObject,
  SupportJSValue,
  SyncObject
} from './types'

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
