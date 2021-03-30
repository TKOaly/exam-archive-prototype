const React = require('react')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')

const FolderIcon = require('./FolderIcon')

const CourseListItem = ({ name, url, lastModified }) => {
  return (
    <div role="row" className="course-list-item">
      <FolderIcon aria-hidden="true" className="course-list-item__icon" />
      <div
        role="cell"
        lang="fi-FI"
        className="course-list-item__link-container"
      >
        <a
          data-instant
          href={url}
          title={name}
          className="course-list-item__link"
        >
          {name}
        </a>
      </div>
      <div className="course-list-item__last-modified" role="cell">
        {lastModified && (
          <time dateTime={lastModified.toISOString()}>
            {formatDate(lastModified, 'yyyy-MM-dd', { locale: fiLocale })}
          </time>
        )}
      </div>
    </div>
  )
}

const CourseListHeader = () => {
  return (
    <div role="row" className="course-list-header">
      <div role="columnheader" className="course-list-header__name">
        Course
      </div>
      <div role="columnheader" className="course-list-header__last-modified">
        Last modified
      </div>
    </div>
  )
}

const CourseList = ({ courses }) => {
  return (
    <div className="course-list-container">
      <div role="table" aria-label="Courses" className="course-list">
        <CourseListHeader />
        {courses.map(course => {
          return (
            <CourseListItem
              key={course.id}
              name={course.name}
              url={course.url}
              lastModified={course.lastModified}
            />
          )
        })}
      </div>
    </div>
  )
}

module.exports = CourseList
