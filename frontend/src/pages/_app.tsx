import React from 'react'
import App from 'next/app'
import { AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'

class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props

    return (
      <Layout>
        <AnimatePresence exitBeforeEnter initial={false}>
          <Component {...pageProps} key={router.route} />
        </AnimatePresence>
      </Layout>
    )
  }
}

export default MyApp
