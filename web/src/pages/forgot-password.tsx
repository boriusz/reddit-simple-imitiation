import React, { useState } from 'react'
import { Wrapper } from '../components/Wrapper'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import { useForgotPasswordMutation } from '../generated/graphql'
import { NextPage } from 'next'

const ForgotPassword: NextPage = () => {
  const [complete, setComplete] = useState(false)
  const [forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values })
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>email sent</Box>
          ) : (
            <Form>
              <InputField
                label={'Email or Email'}
                name={'email'}
                placeholder={'email'}
                type={'email'}
              />
              <Button mt={4} type={'submit'} isLoading={isSubmitting} colorScheme={'teal'}>
                Forgot Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export { getServerSideProps } from '../components/ChakraCookieWrapper'
export default ForgotPassword
