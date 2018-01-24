import React from 'react'
import * as moment from 'moment'
import CourseList from './CourseList'
import ShrinkingHeader from './ShrinkingHeader'
import ListingNavigation from './ListingNavigation'
import * as courses from '../data/courses.json'
import './App.css'

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

const App = () => (
  <div className="app">
    <div className="app__header-spacing" />
    <ShrinkingHeader className="app__header" />
    <ListingNavigation
      className="app__listing-navigation"
      title="Courses"
      showBackButton={false}
    />
    <main className="app__content">
      <CourseList
        className="app__course-list"
        courses={apiToAppModel(courses)}
      />
    </main>
  </div>
)

export default App
