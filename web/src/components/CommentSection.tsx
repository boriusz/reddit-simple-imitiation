import React, { useState } from 'react'
import {
  CreateCommentMutation,
  PostCommentFragment,
  PostSnippetFragment,
  useCreateCommentMutation,
  usePostCommentsLazyQuery,
} from '../generated/graphql'
import { Box, Button, IconButton, VStack } from '@chakra-ui/react'
import { AddIcon, ChatIcon } from '@chakra-ui/icons'
import { Form, Formik } from 'formik'
import { InputField } from './InputField'
import { ApolloCache, gql } from '@apollo/client'
import { Comment } from './Comment'

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
        fragment ____ on Post {
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
  const [getComments, { data, refetch }] = usePostCommentsLazyQuery({ variables: { id } })

  const [createCommentInput, setCreateCommentInput] = useState(false)
  const CommentManagementButtons = (
    <>
      <IconButton
        variant={'outline'}
        aria-label={'Add comment'}
        icon={<AddIcon />}
        size={'sm'}
        onClick={() => {
          setCreateCommentInput((prevState) => !prevState)
        }}
      />
      <IconButton
        variant={'outline'}
        icon={<ChatIcon />}
        aria-label={'Comments load and count'}
        size={'sm'}
        ml={'1px'}
        onClick={() => {
          if (commentsVisible) {
            setCommentsVisible(false)
          } else {
            setCommentsVisible(true)
            getComments()
          }
        }}
      />
      {commentsNumber}
    </>
  )

  const CreateCommentForm = (
    <Formik
      initialValues={{ text: '' }}
      onSubmit={async (values: { text: string }) => {
        setCreateCommentInput(false)
        await createComment({
          variables: { ...values, postId: id },
          update: (cache) => {
            updateAfterComment(id, cache)
          },
        })
        if (refetch) {
          await refetch()
        }
      }}
    >
      <Form style={{ margin: 0, padding: 0 }}>
        <InputField label={'Comment Text'} name={'text'} placeholder={'comment text'} textarea />
        <Button type={'submit'} size={'sm'}>
          Add
        </Button>
        <Button
          onClick={() => {
            setCreateCommentInput(false)
          }}
          size={'sm'}
        >
          Cancel
        </Button>
      </Form>
    </Formik>
  )

  return (
    <>
      {createCommentInput ? CreateCommentForm : null}
      <Box>
        <Box m={1}>{CommentManagementButtons}</Box>
        {commentsVisible && (
          <VStack spacing={0}>
            {data?.postComments
              .slice()
              .sort((a, b) => Number(a.createdAt) - Number(b.createdAt))
              .map((comment: PostCommentFragment) => (
                <Comment key={comment.id} comment={comment} postId={id} refetch={refetch} />
              ))}
          </VStack>
        )}
      </Box>
    </>
  )
}
