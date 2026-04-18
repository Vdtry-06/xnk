import { useState, useEffect, useRef, useCallback } from 'react'

export function useApi(apiFn, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const fnRef = useRef(apiFn)
  useEffect(() => { fnRef.current = apiFn })

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fnRef.current()
      setData(res.data?.data ?? res.data ?? null)
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Lỗi')
    } finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, error, refetch: fetch }
}
