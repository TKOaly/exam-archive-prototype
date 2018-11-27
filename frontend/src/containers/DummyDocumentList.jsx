import React from 'react'
import moment from 'moment'
import dummyCourses from '../data/courses.json'
import DocumentList from '../components/DocumentList'
import NotFound from '../components/NotFound'

const momentifyLastModified = document => {
  return {
    ...document,
    lastModified: moment(document.lastModified)
  }
}

const apiToAppModel = courses => {
  const appModelCourses = courses.map(course => ({
    ...course,
    documents: course.documents
      ? course.documents.map(momentifyLastModified)
      : undefined
  }))
  appModelCourses.sort((a, b) => a.name.localeCompare(b.name))
  return appModelCourses
}

const DummyDocumentList = ({ match }) => {
  const courses = apiToAppModel(dummyCourses)
  const requestedCourse = match.params.courseName
  const matchingCourse = courses.find(course => course.name === requestedCourse)
  if (!matchingCourse) return <NotFound />

  return <DocumentList documents={matchingCourse.documents} />
}

export default DummyDocumentList
