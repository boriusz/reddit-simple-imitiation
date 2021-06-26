import React, { FC } from 'react'
import { Box, Button, Flex, Link, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { useApolloClient } from '@apollo/client'
import { DarkModeSwitch } from './DarkModeSwitch'

const NavBar: FC = () => {
  const [logout, { loading: logoutFetching }] = useLogoutMutation()
  const bg = useColorModeValue('green', '#16161D')

  const { data, loading } = useMeQuery({})

  const apolloClient = useApolloClient()

  let body = null

  if (!loading) {
    if (data?.me) {
      body = (
        <Flex>
          <Box mr={2}>{data.me.username}</Box>
          <Button
            onClick={async () => {
              await logout()
              await apolloClient.resetStore()
            }}
            variant={'link'}
            isLoading={logoutFetching}
          >
            logout
          </Button>
        </Flex>
      )
    } else {
      body = (
        <>
          <NextLink href={'/login'}>
            <Link mr={2}>Login</Link>
          </NextLink>

          <NextLink href={'/register'}>
            <Link mr={2}>Register</Link>
          </NextLink>
        </>
      )
    }
  }

  return (
    <Flex bg={bg} shadow={2} p={4}>
      <NextLink href={'/'}>
        <Link>
          <Box mt={'auto'}>Home</Box>
        </Link>
      </NextLink>
      <DarkModeSwitch />
      <Box ml={'auto'}>{body}</Box>
    </Flex>
  )
}

export default NavBar
