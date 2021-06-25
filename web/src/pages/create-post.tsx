import React, { useEffect } from 'react'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import { useCreatePostMutation, useMeQuery } from '../generated/graphql'
import { Box, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { NextPage } from 'next'

const CreatePost: NextPage = () => {
  const router = useRouter()
  const { data, loading } = useMeQuery()
  useEffect(() => {
    if (!data?.me && !loading) {
      router.replace('/login').then()
    }
  }, [loading, data, router])

  const [createPost] = useCreatePostMutation()
  return (
    <Layout variant={'small'}>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const data = await createPost({ variables: { input: values } })
          if (!data.errors) {
            await router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name={'title'} placeholder={'post title'} label={'Post Title'} />
            <Box mt={4}>
              <InputField label={'Post Text'} name={'text'} placeholder={'post text'} textarea />
            </Box>
            <Button mt={4} type={'submit'} isLoading={isSubmitting} colorScheme={'teal'}>
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export { getServerSideProps } from '../components/ChakraCookieWrapper'
export default CreatePost
