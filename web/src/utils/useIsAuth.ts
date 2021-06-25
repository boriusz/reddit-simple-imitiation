import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'
import { useRouter } from 'next/router'

export const useIsAuth = (): void => {
  const { data, loading } = useMeQuery()
  const router = useRouter()
  useEffect(() => {
    if (!data?.me && !loading) {
      router.replace('/login?next=' + router.pathname).then()
    }
  }, [loading, data, router])
}
