import React from 'react'
import {
  DeleteCommentMutation,
  PostCommentFragment,
  useDeleteCommentMutation,
  useMeQuery,
  usePostCommentsQuery,
} from '../generated/graphql'
import { Box, IconButton, Text, VStack } from '@chakra-ui/react'
import { EditPostModal } from './EditPostModal'
import { DeleteIcon } from '@chakra-ui/icons'
import { ApolloCache, gql } from '@apollo/client'

interface CommentsStackProps {
  postId: number
}

const updateAfterCommentDelete = (
  postId: number,
  cache: ApolloCache<DeleteCommentMutation>
): void => {
  const data = cache.readFragment<{ id: number; commentsNumber: number }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        commentsNumber
      }
    `,
  })
  if (data) {
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          commentsNumber
        }
      `,
      data: { id: postId, commentsNumber: data.commentsNumber - 1 },
    })
  }
}

export const CommentsStack: React.FC<CommentsStackProps> = ({ postId }) => {
  const [deleteComment] = useDeleteCommentMutation()
  const { data: comments, refetch } = usePostCommentsQuery({
    variables: { id: postId },
  })
  const { data } = useMeQuery()
  return (
    <VStack>
      {comments?.postComments.map((comment: PostCommentFragment) => (
        <Box key={comment.id} w={'100%'}>
          <Box shadow={'sm'} borderWidth={'1px'} key={comment.id}>
            <Text>by {comment.user.username}</Text>
            {comment.text}
            <Box ml={'auto'}>
              {comment.user.id === data?.me?.id ? (
                <>
                  <EditPostModal postId={comment.id} />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label={'Delete comment'}
                    ml={1}
                    size={'sm'}
                    onClick={async () => {
                      try {
                        await deleteComment({
                          variables: { commentId: comment.id },
                          update: (cache) => {
                            cache.evict({ id: 'Comment:' + comment.id })
                            updateAfterCommentDelete(postId, cache)
                          },
                        })
                        await refetch()
                      } catch (e) {
                        console.log(e)
                      }
                    }}
                  />
                </>
              ) : null}
            </Box>
          </Box>
        </Box>
      ))}
    </VStack>
  )
}
