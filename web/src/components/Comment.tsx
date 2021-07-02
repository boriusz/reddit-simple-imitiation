import React, { useState } from 'react'
import { Box, Button, Divider, IconButton, Text } from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  DeleteCommentMutation,
  Exact,
  PostCommentFragment,
  PostCommentsQuery,
  useDeleteCommentMutation,
  useEditCommentMutation,
  useMeQuery,
} from '../generated/graphql'
import { ApolloCache, ApolloQueryResult, gql } from '@apollo/client'
import { Form, Formik } from 'formik'
import { InputField } from './InputField'

interface CommentProps {
  comment: PostCommentFragment
  postId: number
  refetch:
    | ((
        variables?: Partial<Exact<{ id: number }>> | undefined
      ) => Promise<ApolloQueryResult<PostCommentsQuery>>)
    | undefined
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
        fragment ___ on Post {
          commentsNumber
        }
      `,
      data: { id: postId, commentsNumber: data.commentsNumber - 1 },
    })
  }
}

export const Comment: React.FC<CommentProps> = ({ comment, postId, refetch }) => {
  const [deleteComment] = useDeleteCommentMutation()
  const [edit, setEdit] = useState(false)
  const { data } = useMeQuery()
  const [editComment] = useEditCommentMutation()
  return (
    <Box w={'100%'} p={2}>
      <Divider />
      {edit ? (
        <Formik
          initialValues={{ text: comment.text }}
          onSubmit={async (values: { text: string }) => {
            setEdit(false)

            await editComment({
              variables: { commentId: comment.id, text: values.text },
              // update: (cache) => {
              //   updateAfterComment(id, cache)
              // },
            })
            if (refetch) {
              await refetch()
            }
          }}
        >
          <Form style={{ margin: 0, padding: 0 }}>
            <InputField
              label={'Comment Text'}
              name={'text'}
              placeholder={'comment text'}
              textarea
            />
            <Button type={'submit'} size={'sm'}>
              Edit
            </Button>
            <Button
              onClick={() => {
                setEdit(false)
              }}
              size={'sm'}
            >
              Cancel
            </Button>
          </Form>
        </Formik>
      ) : (
        <>
          <Text>by {comment.user.username}</Text>
          {comment.text}
          <Box ml={'auto'}>
            {comment.user.id === data?.me?.id ? (
              <>
                <IconButton
                  aria-label={'Edit comment'}
                  icon={<EditIcon />}
                  size={'sm'}
                  onClick={() => {
                    console.log('edit')
                    setEdit(true)
                  }}
                />
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
                      if (refetch) {
                        await refetch()
                      }
                    } catch (e) {
                      console.log(e)
                    }
                  }}
                />
              </>
            ) : null}
          </Box>
        </>
      )}
    </Box>
  )
}
