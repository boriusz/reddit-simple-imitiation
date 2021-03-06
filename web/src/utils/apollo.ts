import { useMemo } from 'react'
import { createClient } from './createApolloClient'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

let apolloClient: ApolloClient<NormalizedCacheObject>

export function initializeApollo(
  initialState?: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createClient()

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient
  return _apolloClient
}

export function useApollo(
  initialState: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => initializeApollo(initialState), [initialState])
}
