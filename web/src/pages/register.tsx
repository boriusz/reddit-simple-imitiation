import React from 'react'
import { Form, Formik } from 'formik'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

const Register: NextPage = () => {
  const router = useRouter()
  const [register] = useRegisterMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { options: values },
            update: (cache, data) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: { __typename: 'Query', me: data.data?.register.user },
              })
              cache.evict({ fieldName: 'posts' })
            },
          })
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user) {
            await router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField label={'Username'} name={'username'} placeholder={'username'} />
            <Box mt={4}>
              <InputField label={'Email'} name={'email'} placeholder={'email'} />
            </Box>
            <Box mt={4}>
              <InputField
                label={'Password'}
                name={'password'}
                placeholder={'password'}
                type={'password'}
              />
            </Box>
            <Button mt={4} type={'submit'} isLoading={isSubmitting} colorScheme={'teal'}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export { getServerSideProps } from '../components/ChakraCookieWrapper'
export default Register
