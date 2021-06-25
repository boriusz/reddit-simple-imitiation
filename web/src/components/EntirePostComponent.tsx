import React from 'react'
import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { UpvoteSection } from './UpvoteSection'
import NextLink from 'next/link'
import { EntirePostFragment } from '../generated/graphql'

interface PostProps {
  post: EntirePostFragment
}

export const EntirePostComponent: React.FC<PostProps> = ({ post }) => {
  return (
    <Flex key={post.id} shadow={'md'} p={5} borderWidth={'1px'}>
      <UpvoteSection post={post} />
      <Box>
        <NextLink href={'/post/[id]'} as={`/post/${post.id}`}>
          <Link mt={4}>
            <Heading fontSize={'xl'}>{post.title}</Heading>
          </Link>
        </NextLink>
        <Text>by {post.creator.username}</Text>
        <Text mt={4}>{post.text}</Text>
      </Box>
    </Flex>
  )
}
