import React from 'react'
import * as moment from 'moment'
import CourseList from './components/CourseList'
import Header from './components/Header'
import * as courses from './data/courses.json'
import './App.css'

const momentifyLastModified = document => {
  return {
    ...document,
    lastModified: moment(document.lastModified)
  }
}

const apiToAppModel = courses => {
  return courses.map(course => ({
    ...course,
    documents: course.documents ? course.documents.map(momentifyLastModified) : undefined
  }))
}

const App = () => (
  <div className="app">
    <Header className="app__header" />
    <CourseList className="app__course-list" courses={apiToAppModel(courses)} />
  </div>
)
export default App
