import React, { useState } from 'react'
import { NextPage } from 'next'
import { Wrapper } from '../../components/Wrapper'
import { Form, Formik } from 'formik'
import { toErrorMap } from '../../utils/toErrorMap'
import { InputField } from '../../components/InputField'
import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { MeDocument, MeQuery, useChangePasswordMutation } from '../../generated/graphql'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

const ChangePassword: NextPage = () => {
  const router = useRouter()
  const [tokenError, setTokenError] = useState('')
  const [changePassword] = useChangePasswordMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token: typeof router.query.token === 'string' ? router.query.token : '',
            },
            update: (cache, data) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: { __typename: 'Query', me: data.data?.changePassword.user },
              })
            },
          })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap) {
              setTokenError(errorMap.token)
            }
            setErrors(errorMap)
          } else if (response.data?.changePassword.user) {
            await router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label={'New Password'}
              name={'newPassword'}
              placeholder={'new password'}
              type={'password'}
            />
            {tokenError ? (
              <Flex>
                <Box mr={2} style={{ color: 'red' }}>
                  {tokenError}
                </Box>
                <NextLink href={'/forgot-password'}>
                  <Link>forget again</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button mt={4} type={'submit'} isLoading={isSubmitting} colorScheme={'teal'}>
              Change
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export { getServerSideProps } from '../../components/ChakraCookieWrapper'
export default ChangePassword
