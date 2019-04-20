import React from 'react'
import { History } from 'history'
import DocumentList from './DocumentList'

type DocumentListPageProps = {
  courseId: string | number
  courseSlug: string
  history: History
}

type DocumentListPageState = {
  documents: Array<Document>
  isLoading: boolean
}

class DocumentListPage extends React.Component<
  DocumentListPageProps,
  DocumentListPageState
> {
  state = {
    documents: [],
    isLoading: true
  }

  async componentDidMount() {
    const { courseId, courseSlug, history } = this.props

    const res = await fetch(`/api/courses/${courseId}`)
    if (res.status === 404) {
      history.push('/')
      return
    }

    const course = await res.json()
    this.setState({ documents: course.exams, isLoading: false })
  }

  render() {
    const { documents, isLoading } = this.state
    return <DocumentList isLoading={isLoading} documents={documents} />
  }
}

export default DocumentListPage
