import { useEffect, useRef, useState, useCallback } from 'react'

const MAX_RETRIES = 1

export function useAutoSave(saveFn, data, delay = 800) {
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const timeoutRef = useRef(null)
  const initialRef = useRef(true)
  const prevDataRef = useRef(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)
  const saveFnRef = useRef(saveFn)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    saveFnRef.current = saveFn
  }, [saveFn])

  const doSave = useCallback(async () => {
    if (!mountedRef.current) return false
    setSaveStatus('saving')
    while (mountedRef.current) {
      try {
        await saveFnRef.current()
        if (!mountedRef.current) return false
        setSaveStatus('saved')
        retryCountRef.current = 0
        return true
      } catch {
        if (!mountedRef.current) return false
        if (retryCountRef.current >= MAX_RETRIES) {
          setSaveStatus('error')
          return false
        }
        retryCountRef.current++
      }
    }
    return false
  }, [])

  const retry = useCallback(() => {
    retryCountRef.current = 0
    doSave()
  }, [doSave])

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false
      prevDataRef.current = JSON.stringify(data)
      return
    }

    const serialized = JSON.stringify(data)
    if (serialized === prevDataRef.current) return
    prevDataRef.current = serialized

    retryCountRef.current = 0
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(doSave, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [data, delay, doSave])

  const flush = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    retryCountRef.current = 0
    return doSave()
  }, [doSave])

  return { saveStatus, retry, flush }
}
