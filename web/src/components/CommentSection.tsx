import React from 'react'
import { PostCommentFragment } from '../generated/graphql'
import { Box, Text } from '@chakra-ui/react'

interface CommentSectionProps {
  comments: PostCommentFragment[]
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
  let body: JSX.Element
  if (comments.length > 0) {
    body = (
      <Box>
        {comments?.map((com) => (
          <Box
            shadow={'sm'}
            borderWidth={'1px'}
            key={com.user.id.toString() + Math.random() + Date.now()}
          >
            <Text>by {com.user.username}</Text>
            {com.value}
          </Box>
        ))}
      </Box>
    )
  } else {
    body = <Text>No comments for now</Text>
  }
  return body
}
