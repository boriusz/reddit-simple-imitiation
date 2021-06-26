import React, { useState } from 'react'
import {
  PostCommentFragment,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useMeQuery,
} from '../generated/graphql'
import { Box, Button, IconButton, Text } from '@chakra-ui/react'
import { EditPostModal } from './EditPostModal'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { Form, Formik } from 'formik'
import { InputField } from './InputField'

interface CommentSectionProps {
  comments: PostCommentFragment[]
  postId: number
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId }) => {
  const { data } = useMeQuery()
  const [deleteComment] = useDeleteCommentMutation()
  const [createComment] = useCreateCommentMutation()

  const [createCommentInput, setCreateCommentInput] = useState(false)
  let body: JSX.Element
  if (comments.length <= 0) {
    body = <Text>No comments for now </Text>
  } else {
    body = (
      <Box>
        {comments
          .slice()
          ?.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
          .map((com) => (
            <Box shadow={'sm'} borderWidth={'1px'} key={com.id}>
              <Text>by {com.user.username}</Text>
              {com.text}
              <Box ml={'auto'}>
                {com.user.id === data?.me?.id ? (
                  <>
                    <EditPostModal postId={com.id} />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label={'Delete comment'}
                      ml={1}
                      size={'sm'}
                      onClick={() =>
                        deleteComment({
                          variables: { commentId: com.id },
                        })
                      }
                    />
                  </>
                ) : null}
              </Box>
            </Box>
          ))}
      </Box>
    )
  }
  return (
    <>
      {createCommentInput ? (
        <Formik
          initialValues={{ text: '' }}
          onSubmit={async (values: { text: string }) => {
            setCreateCommentInput(false)
            await createComment({
              variables: { ...values, postId: postId },
              // update: (cache) => {
              //   cache.evict({ fieldName: 'posts' }) // need to decide what to do with cache,
              // // maybe fetch comments separately
              // },
            })
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
              Dodaj
            </Button>
          </Form>
        </Formik>
      ) : (
        <IconButton
          aria-label={'Add comment'}
          icon={<AddIcon />}
          size={'sm'}
          onClick={() => {
            setCreateCommentInput((prevState) => !prevState)
          }}
        />
      )}
      {body}
    </>
  )
}
