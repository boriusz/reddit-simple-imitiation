import React, { FC } from 'react'
import { useField } from 'formik'
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react'

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  textarea?: boolean
}

export const InputField: FC<InputFieldProps> = ({ label, type, textarea, ...props }) => {
  const [field, { error }] = useField(props)
  const C = textarea ? Textarea : Input
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={props.name}>{label}</FormLabel>
      <C {...field} id={field.name} type={type} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  )
}
