import React from 'react'
import * as moment from 'moment'
import CourseList from '../components/CourseList'
import * as courses from '../data/courses.json'

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

const DummyCourseList = () => <CourseList courses={apiToAppModel(courses)} />

export default DummyCourseList
