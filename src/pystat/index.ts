import { computed, Ref, ref } from 'vue'

const syncStatusTable = new WeakMap<Ref, Ref<boolean>>()

const pystat = (variable: Ref): Ref<boolean> => {
  const stat = syncStatusTable.get(variable)
  if (stat) {
    return stat
  }
  throw new Error('Variable is not associated with a status ref.')
}

const initStatus = (variable: Ref) => {
  const isSyncingRef = ref(false)
  syncStatusTable.set(variable, isSyncingRef)
  const setSyncStatusToSynced = () => {
    isSyncingRef.value = false
  }
  const setSyncStatusToSyncing = () => {
    isSyncingRef.value = true
  }
  const isSyncing = computed(() => isSyncingRef.value)
  const isSynced = computed(() => !isSyncingRef.value)
  return {
    isSyncing,
    isSynced,
    setSyncStatusToSynced,
    setSyncStatusToSyncing
  }
}

export { pystat, initStatus }
