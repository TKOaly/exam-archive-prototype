import React from 'react'
import * as moment from 'moment'
import * as dummyCourses from '../data/courses.json'

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
  if (!matchingCourse) return <p>Course '{requestedCourse}' does not exist.</p>

  if (!matchingCourse.documents || matchingCourse.documents.length === 0)
    return <p>No documents found</p>

  return (
    <ul>
      {matchingCourse.documents.map(d => (
        <ul key={d.filename}>
          {d.filename} -{' '}
          {d.lastModified && d.lastModified.format('YYYY-MM-DD hh:mm')} -{' '}
          {d.size}
        </ul>
      ))}
    </ul>
  )
}

export default DummyDocumentList
