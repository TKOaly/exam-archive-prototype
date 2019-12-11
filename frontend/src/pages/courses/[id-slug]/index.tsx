import React from 'react'
import { History } from 'history'
import fetch from 'isomorphic-unfetch'
import { NextPage } from 'next'
import Router from 'next/router'
import { motion } from 'framer-motion'

import DocumentList from '../../../components/courses/DocumentList'
import ListingNavigation from '../../../components/ListingNavigation'
import { generateCourseSlug } from '../../../components/slug'
import { hrefToCourse } from '../../../components/utils'
import { transitions } from '../../../components/animations'
import { DetailedCourse } from '../../../domain'
import { makeUrl } from '../../../api'
import './index.scss'

interface DocumentListPageProps {
  courseId: string | number
  courseSlug: string
  history: History
}

interface DocumentListPageState {
  isLoading: boolean
  course: DetailedCourse | null
}

/*
class DocumentListPage extends React.Component<
  DocumentListPageProps,
  DocumentListPageState
> {
  state: DocumentListPageState = {
    isLoading: true,
    course: null
  }

  async componentDidMount() {
    const { courseId, courseSlug, history } = this.props

    const res = await fetch(`/api/courses/${courseId}`)
    if (res.status === 404) {
      history.push('/')
      return
    }

    const course: DetailedCourse = await res.json()
    this.setState({ course, isLoading: false })
    replaceSlugIfIncorrect(courseSlug, course, history)
  }

  render() {
    const { course, isLoading } = this.state
    const title = course ? course.name : 'Loading...'

    return (
      <Layout>
        <ListingNavigation title={title} backButtonHref="/courses" />
        <main className="document-list-page">
          <DocumentList
            isLoading={isLoading}
            documents={course ? course.exams : []}
          />
        </main>
      </Layout>
    )
  }
}*/

interface Props {
  course: DetailedCourse | null
}

const DocumentListPage: NextPage<Props> = ({ course }) => {
  if (!course) {
    return null
  }

  const title = course.name

  return (
    <motion.div
      key="document-list-container"
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <ListingNavigation title={title} backButtonHref="/courses" />
      <motion.main
        key="document-list-main"
        className="document-list-page"
        variants={{
          initial: { y: 30, opacity: 0 },
          enter: {
            y: 0,
            opacity: 1,
            transition: transitions.in
          },
          exit: {
            y: -30,
            opacity: 0,
            transition: transitions.out
          }
        }}
      >
        <DocumentList isLoading={false} documents={course.exams} />
      </motion.main>
    </motion.div>
  )
}

const idSlugRegex = /([0-9]+)(-?)(.*)/

const parseIdSlug = (idSlugString: string) => {
  const match = idSlugRegex.exec(idSlugString)
  if (!match) return null

  const id = match[1]
  const slug = match[3]
  return { id, slug }
}

const cache: { [id: string]: DetailedCourse | undefined } = {}

DocumentListPage.getInitialProps = async ctx => {
  const result = parseIdSlug(ctx.query['id-slug'] as string)
  if (!result) {
    throw Error('parse fail')
  }

  const { id, slug } = result

  let course: DetailedCourse | undefined
  const cached = cache[id]
  if (cached) {
    course = cached
  } else {
    const res = await fetch(makeUrl(`/api/courses/${id}`), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    course = await res.json()
    cache[id] = course
  }

  if (!course) {
    throw new Error('')
  }

  const properSlug = generateCourseSlug(course.name)
  if (slug !== properSlug) {
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: hrefToCourse(course.id, course.name)
      })
      ctx.res.end()
    } else {
      Router.push(hrefToCourse(course.id, course.name))
    }
    return { course: null }
  }

  return { course }
}

export default DocumentListPage
