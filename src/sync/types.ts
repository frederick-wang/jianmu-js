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

type JSONObject = { [member: string]: JSONValue }
type JSONArray = JSONValue[]
type JSONValue = string | number | boolean | null | JSONObject | JSONArray

type SupportJSObject = { [member: string]: SupportJSValue }
type SupportJSArray = SupportJSValue[]
type SupportJSValue = File | JSONValue | SupportJSObject | SupportJSArray

export type {
  SyncObject,
  SyncObjectDataFile,
  SyncObjectType,
  SyncObjectSource,
  SyncObjectVersion,
  SyncObjectProtocol,
  SupportJSValue,
  SupportJSArray,
  SupportJSObject,
  JSONValue,
  JSONArray,
  JSONObject
}
