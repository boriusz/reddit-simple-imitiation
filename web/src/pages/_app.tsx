import React from 'react'
import { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../utils/apollo'
import { ChakraCookieWrapper } from '../components/ChakraCookieWrapper'

const App = ({ Component, pageProps }: AppProps) => {
  const apolloClient = useApollo(pageProps.apolloState)

  return (
    <ApolloProvider client={apolloClient}>
      <ChakraCookieWrapper cookies={pageProps.cookies}>
        <Component {...pageProps} />
      </ChakraCookieWrapper>
    </ApolloProvider>
  )
}

export default App
