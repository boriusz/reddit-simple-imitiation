import {
  Box,
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import React, { FC } from 'react'
import { Form, Formik } from 'formik'
import { InputField } from './InputField'
import { usePostQuery, useUpdatePostMutation } from '../generated/graphql'
import { useOpen } from '../utils/useOpen'
import { EditIcon } from '@chakra-ui/icons'

interface EditPostModalInterface {
  postId: number
}

export const EditPostModal: FC<EditPostModalInterface> = ({ postId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const myOpen = useOpen(onOpen)
  const { data } = usePostQuery({ variables: { id: postId }, skip: !isOpen })

  const [updatePost] = useUpdatePostMutation()
  return (
    <>
      {/*<Button onClick={myOpen}>Edit</Button>*/}
      <IconButton aria-label={'Edit'} onClick={myOpen} icon={<EditIcon />} />

      {data ? (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit post</ModalHeader>
            <ModalCloseButton />
            <Formik
              initialValues={{ title: data.post?.title, text: data.post?.text }}
              onSubmit={async (values) => {
                const data = await updatePost({
                  variables: {
                    id: postId,
                    ...(values as { title: string; text: string }),
                  },
                })
                if (!data.errors) {
                  onClose()
                }
              }}
            >
              {({ isSubmitting }) => (
                <ModalBody p={4}>
                  <Form style={{ margin: '0', padding: '0' }}>
                    <InputField name={'title'} placeholder={'post title'} label={'Post Title'} />
                    <Box mt={4}>
                      <InputField
                        label={'Post Text'}
                        name={'text'}
                        placeholder={'post text'}
                        textarea
                      />
                    </Box>
                    <ModalFooter px={0}>
                      <Button type={'submit'} mr={3} isLoading={isSubmitting} colorScheme={'teal'}>
                        Update
                      </Button>
                      <Button color="blue" onClick={onClose}>
                        Cancel
                      </Button>
                    </ModalFooter>
                  </Form>
                </ModalBody>
              )}
            </Formik>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  )
}
