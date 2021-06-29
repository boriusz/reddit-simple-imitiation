import { ChakraProvider, cookieStorageManager, localStorageManager } from '@chakra-ui/react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React from 'react'
import theme from '../theme'

interface ChakraCookieWrapperProps {
  cookies: unknown
}

export const ChakraCookieWrapper: React.FC<ChakraCookieWrapperProps> = ({
  cookies,
  children,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const colorModeManager =
    typeof cookies === 'string' ? cookieStorageManager(cookies) : localStorageManager

  return (
    <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
      {children}
    </ChakraProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}
