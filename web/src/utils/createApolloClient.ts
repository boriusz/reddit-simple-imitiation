import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { PaginatedPosts } from '../generated/graphql'

export const createClient = (): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: 'http://localhost:4000/graphql',
      credentials: 'include',
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts ?? []), ...incoming.posts],
                }
              },
            },
          },
        },
      },
    }),
  })
}
