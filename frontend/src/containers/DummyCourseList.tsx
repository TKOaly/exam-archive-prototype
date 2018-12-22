import React from 'react'
import moment from 'moment'
import CourseList from '../components/CourseList'
import courses from '../data/courses.json'
import { Document, Course } from '../domain'

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

const DummyCourseList = () => <CourseList courses={apiToAppModel(courses)} />

export default DummyCourseList
