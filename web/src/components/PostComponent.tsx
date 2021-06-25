import React from 'react'
import { Box, Flex, Heading, IconButton, Link, Text } from '@chakra-ui/react'
import { UpvoteSection } from './UpvoteSection'
import NextLink from 'next/link'
import { PostSnippetFragment, useDeletePostMutation, useMeQuery } from '../generated/graphql'
import { EditPostModal } from './EditPostModal'
import { DeleteIcon } from '@chakra-ui/icons'

interface PostProps {
  post: PostSnippetFragment
}

export const PostComponent: React.FC<PostProps> = ({ post }) => {
  const [deletePost] = useDeletePostMutation()
  const { data } = useMeQuery()
  return (
    <Flex key={post.id} shadow={'md'} p={5} borderWidth={'1px'}>
      <UpvoteSection post={post} />
      <Box flex={1}>
        <NextLink href={'/post/[id]'} as={`/post/${post.id}`}>
          <Link mt={4}>
            <Heading fontSize={'xl'}>{post.title}</Heading>
          </Link>
        </NextLink>
        <Text>by {post.creator.username}</Text>
        <Flex flex={1}>
          <Text mt={4}>{post.textSnippet}</Text>
          <Box ml={'auto'}>
            {post.creator.id === data?.me?.id ? (
              <>
                <EditPostModal postId={post.id} />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label={'Delete Post'}
                  ml={1}
                  onClick={() =>
                    deletePost({
                      variables: { id: post.id },
                      update: (cache) => cache.evict({ id: 'Post:' + post.id }),
                    })
                  }
                />
              </>
            ) : null}
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}
