import React from 'react'
import { Form, Formik } from 'formik'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { Button, Flex, Link } from '@chakra-ui/react'
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { NextPage } from 'next'

const Login: NextPage = () => {
  const router = useRouter()
  const [login] = useLoginMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: values,
            update: (cache, data) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data.data?.login.user,
                },
              })
              cache.evict({ fieldName: 'posts' })
            },
          })
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              await router.push(router.query.next)
            } else {
              await router.push('/')
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              value={'xd'}
              label={'Username or Email'}
              name={'usernameOrEmail'}
              placeholder={'username'}
            />
            <InputField
              label={'Password'}
              name={'password'}
              placeholder={'password'}
              type={'password'}
            />
            <Flex direction={'row-reverse'} justifyContent={'space-between'}>
              <NextLink href={'/forgot-password'}>
                <Link mt={4}>forgot password</Link>
              </NextLink>
              <Button mt={4} type={'submit'} isLoading={isSubmitting} colorScheme={'teal'}>
                Login
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export { getServerSideProps } from '../components/ChakraCookieWrapper'
export default Login
