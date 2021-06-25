import { Button, useColorMode } from '@chakra-ui/react'
import React from 'react'

export const DarkModeSwitch: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <>
      <Button ml={2} onClick={toggleColorMode} mt={-2}>
        {colorMode}
      </Button>
    </>
  )
}
