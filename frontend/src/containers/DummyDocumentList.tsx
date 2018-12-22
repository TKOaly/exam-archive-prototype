import React from 'react'
import moment from 'moment'
import dummyCourses from '../data/courses.json'
import DocumentList from '../components/DocumentList'
import NotFound from '../components/NotFound'
import { Course, Document } from '../domain'

// #region Domain type representations before deserialization
interface DocumentRepr {
  filename: string
  lastModified?: string
  size?: string
}

interface CourseRepr {
  name: string
  documents?: Array<DocumentRepr>
}
// #endregion

const momentifyLastModified = (document: DocumentRepr): Document => {
  return {
    ...document,
    lastModified: moment(document.lastModified)
  }
}

const apiToAppModel = (courses: Array<CourseRepr>): Array<Course> => {
  const appModelCourses = courses.map(course => ({
    ...course,
    documents: course.documents
      ? course.documents.map(momentifyLastModified)
      : undefined
  }))
  appModelCourses.sort((a, b) => a.name.localeCompare(b.name))
  return appModelCourses
}

const DummyDocumentList = ({
  match
}: {
  match: { params: { courseName: string } }
}) => {
  const courses = apiToAppModel(dummyCourses)
  const requestedCourse = match.params.courseName
  const matchingCourse = courses.find(course => course.name === requestedCourse)
  if (!matchingCourse) return <NotFound />

  return <DocumentList documents={matchingCourse.documents} />
}

export default DummyDocumentList
