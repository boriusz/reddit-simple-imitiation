import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { usePostQuery } from '../../generated/graphql'
import Layout from '../../components/Layout'
import { EntirePostComponent } from '../../components/EntirePostComponent'

const Post: NextPage = () => {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  const { data, loading } = usePostQuery({
    skip: id === -1,
    variables: { id },
  })
  if (loading) {
    return <Layout>loading...</Layout>
  }
  if (!data) {
    return <Layout>error loading data</Layout>
  }
  if (!data.post) {
    return <Layout>could not find post</Layout>
  }
  return (
    <Layout>
      <EntirePostComponent post={data.post} />
    </Layout>
  )
}

export { getServerSideProps } from '../../components/ChakraCookieWrapper'
export default Post
