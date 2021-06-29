import React, { useState } from 'react'
import {
  CreateCommentMutation,
  PostSnippetFragment,
  useCreateCommentMutation,
} from '../generated/graphql'
import { Box, Button, IconButton } from '@chakra-ui/react'
import { AddIcon, ChatIcon } from '@chakra-ui/icons'
import { Form, Formik } from 'formik'
import { InputField } from './InputField'
import { CommentsStack } from './CommentsStack'
import { ApolloCache, gql } from '@apollo/client'

interface CommentSectionProps {
  post: PostSnippetFragment
}

const updateAfterComment = (postId: number, cache: ApolloCache<CreateCommentMutation>): void => {
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
      data: { id: postId, commentsNumber: data.commentsNumber + 1 },
    })
  }
}

export const CommentSection: React.FC<CommentSectionProps> = ({ post: { commentsNumber, id } }) => {
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [createComment] = useCreateCommentMutation()

  const [createCommentInput, setCreateCommentInput] = useState(false)
  const commentsButton = (
    <Box>
      <IconButton
        icon={<ChatIcon />}
        aria-label={'Comments load and count'}
        size={'sm'}
        onClick={() => {
          if (commentsVisible) {
            setCommentsVisible(false)
          } else {
            setCommentsVisible(true)
          }
        }}
      />
      {commentsNumber}
    </Box>
  )
  return (
    <>
      {createCommentInput ? (
        <Formik
          initialValues={{ text: '' }}
          onSubmit={async (values: { text: string }) => {
            setCreateCommentInput(false)
            await createComment({
              variables: { ...values, postId: id },
              update: (cache) => {
                console.log(cache)
                updateAfterComment(id, cache)
              },
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
        <Box>
          <IconButton
            aria-label={'Add comment'}
            icon={<AddIcon />}
            size={'sm'}
            onClick={() => {
              setCreateCommentInput((prevState) => !prevState)
            }}
          />
          {commentsButton}
          {commentsVisible && <CommentsStack postId={id} />}
        </Box>
      )}
    </>
  )
}
