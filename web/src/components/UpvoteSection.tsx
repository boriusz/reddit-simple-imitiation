import React, { useState } from 'react'
import { Flex, IconButton } from '@chakra-ui/react'
import {
  PostSnippetFragment,
  EntirePostFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql'
import { ApolloCache, gql } from '@apollo/client'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

interface UpvoteSectionProps {
  post: PostSnippetFragment | EntirePostFragment
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>): void => {
  const data = cache.readFragment<{ id: number; points: number; voteStatus: number }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  })
  if (data) {
    if (data.voteStatus === value) return
    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { id: postId, points: newPoints, voteStatus: value },
    })
  }
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<'not-loading' | 'up-loading' | 'down-loading'>(
    'not-loading'
  )
  const [vote] = useVoteMutation()
  return (
    <Flex flexDir={'column'} textAlign={'center'} mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return
          setLoadingState('up-loading')
          await vote({
            variables: {
              value: 1,
              postId: post.id,
            },
            update: (cache) => updateAfterVote(1, post.id, cache),
          })
          setLoadingState('not-loading')
        }}
        colorScheme={post.voteStatus === 1 ? 'green' : undefined}
        isLoading={loadingState === 'up-loading'}
        icon={<ChevronUpIcon />}
        size={'md'}
        variant={'outline'}
        aria-label={'upvote post'}
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return
          setLoadingState('down-loading')
          await vote({
            variables: {
              value: -1,
              postId: post.id,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          })
          setLoadingState('not-loading')
        }}
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        isLoading={loadingState === 'down-loading'}
        icon={<ChevronDownIcon />}
        size={'md'}
        variant={'outline'}
        aria-label={'upvote post'}
      />
    </Flex>
  )
}
