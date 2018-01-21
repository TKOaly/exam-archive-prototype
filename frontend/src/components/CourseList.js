import React from 'react'
import * as R from 'ramda'
import * as moment from 'moment'
import * as classnames from 'classnames'
import './CourseList.css'

const FolderIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={classnames('folder-icon', className)}
  >
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
)

const CourseListItem = ({ name, lastModified }) => {
  return (
    <li className="course-list-item">
      <FolderIcon className="course-list-item__icon" />
      <a href="/file/asd" className="course-list-item__link" title={name}>
        <span className="course-list-item__name">{name}</span>
      </a>
      <p className="course-list-item__last-modified">
        {lastModified && lastModified.format('YYYY-MM-DD hh:mm')}
      </p>
    </li>
  )
}

const isNotNil = R.complement(R.isNil)

const findLatestModifiedDate = documents => {
  if (!documents) return null
  const documentsTimestamps = R.pluck('lastModified')(documents).filter(isNotNil)
  return moment.max(documentsTimestamps)
}

const CourseList = ({ courses, className }) => {
  const items = courses.map(course => {
    const lastModified = findLatestModifiedDate(course.documents)

    return (
      <CourseListItem
        className="course-list__course-list-item"
        key={course.name}
        name={course.name}
        lastModified={lastModified}
      />
    )
  })

  return (
    <ul className={classnames('course-list', className)}>
      {items}
    </ul>
  )
}

export default CourseList
