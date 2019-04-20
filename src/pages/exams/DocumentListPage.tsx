import React from 'react'
import { History } from 'history'
import DocumentList from './DocumentList'
import ListingNavigation from '../common/ListingNavigation'
import { generateCourseSlug } from '../common/slug'
import { DetailedCourse } from '../../domain'
import './DocumentListPage.scss'

interface DocumentListPageProps {
  courseId: string | number
  courseSlug: string
  history: History
}

interface DocumentListPageState {
  isLoading: boolean
  course: DetailedCourse | null
}

const replaceSlugIfIncorrect = (
  currentSlug: string,
  course: DetailedCourse,
  history: History
) => {
  const properSlug = generateCourseSlug(course.name)
  if (currentSlug !== properSlug) {
    history.replace(`/courses/${course.id}-${properSlug}`)
  }
}

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
      <>
        <ListingNavigation title={title} backButtonHref="/courses" />
        <main className="document-list-page">
          <DocumentList
            isLoading={isLoading}
            documents={course ? course.exams : []}
          />
        </main>
      </>
    )
  }
}

export default DocumentListPage
