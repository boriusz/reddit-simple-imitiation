import {
  Box,
  Button,
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
import { useCreatePostMutation } from '../generated/graphql'
import { useOpen } from '../utils/useOpen'

export const CreatePostModal: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const myOpen = useOpen(onOpen)

  const [createPost] = useCreatePostMutation()
  return (
    <>
      <Button onClick={myOpen}>Create Post</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{ title: '', text: '' }}
            onSubmit={async (values) => {
              const data = await createPost({
                variables: { input: values },
                update: (cache) => {
                  cache.evict({ fieldName: 'posts' })
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
                      Create
                    </Button>
                    <Button color="blue" onClick={onClose}>
                      Close
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  )
}
