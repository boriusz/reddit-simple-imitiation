import { useCallback } from 'react'
import { useMeQuery } from '../generated/graphql'
import { useRouter } from 'next/router'

export const useOpen = (fn: () => void): (() => void) => {
  const { data, loading } = useMeQuery()
  const router = useRouter()

  return useCallback(() => {
    if (!data?.me && !loading) {
      router.replace('/login?next=' + router.pathname).then()
    } else {
      fn()
    }
  }, [data?.me, loading, fn, router])
}
