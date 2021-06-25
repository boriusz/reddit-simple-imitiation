import React from 'react'
import { MeDocument, PostsDocument, useMeQuery, usePostsQuery } from '../generated/graphql'
import Layout from '../components/Layout'
import { CreatePostModal } from '../components/CreatePostModal'
import NextLink from 'next/link'
import { Button, Flex, Link, Stack } from '@chakra-ui/react'
import { GetServerSideProps, NextPage } from 'next'
import { PostComponent } from '../components/PostComponent'
import { initializeApollo } from '../utils/apollo'

const Index: NextPage = () => {
  const {
    data: postData,
    loading: postFetching,
    fetchMore,
    variables,
  } = usePostsQuery({
    variables: { limit: 10, cursor: null as null | string },
    notifyOnNetworkStatusChange: true,
  })
  const { data: meData, loading: meFetching } = useMeQuery()

  if (!postFetching && !postData) {
    return <div>Error</div>
  }

  return (
    <Layout>
      {!meFetching && meData?.me ? (
        <CreatePostModal />
      ) : (
        <span>
          You need to&nbsp;
          <NextLink href={'/login'}>
            <Link>login</Link>
          </NextLink>
          &nbsp;to post.
        </span>
      )}
      <Stack spacing={8} my={4}>
        {postData ? (
          postData.posts.posts.map((p) => (!p ? null : <PostComponent key={p.id} post={p} />))
        ) : (
          <div>loading</div>
        )}
        {postData && postData.posts.hasMore ? (
          <Flex>
            <Button
              onClick={async () => {
                await fetchMore({
                  variables: {
                    limit: variables?.limit,
                    cursor: postData.posts.posts[postData.posts.posts.length - 1].createdAt,
                  },
                })
              }}
              isLoading={postFetching}
              variant={'outline'}
              mx={'auto'}
              my={8}
            >
              Load more
            </Button>
          </Flex>
        ) : null}
      </Stack>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const client = initializeApollo()
  await client.query({
    query: MeDocument,
    context: {
      headers: {
        cookie: req.headers.cookie,
      },
    },
  })
  await client.query({
    query: PostsDocument,
    variables: { limit: 10, cursor: null as null | string },
    context: {
      headers: {
        cookie: req.headers.cookie,
      },
    },
  })

  return {
    props: {
      apolloState: client.cache.extract(),
      cookies: req.headers.cookie ?? '',
    },
  }
}

export default Index
