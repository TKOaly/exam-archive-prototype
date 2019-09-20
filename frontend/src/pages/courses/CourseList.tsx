import React, { FunctionComponent, useState, useCallback } from 'react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import formatDate from 'date-fns/format'

import { CourseListingItem } from '../../domain'
import MoreVertIcon from '../common/MoreVertIcon'
import { WithClassName } from '../common/WithClassName'
import { generateCourseSlug } from '../common/slug'
import FolderIcon from './FolderIcon'
import CourseListMenu from './CourseListMenu'
import './CourseList.scss'

const hrefToCourse = (courseId: number | string, courseName: string) =>
  `/courses/${courseId}-${encodeURI(generateCourseSlug(courseName))}`

interface ListingAlphabetProps {
  letter: string
}

const ListingAlphabet: FunctionComponent<ListingAlphabetProps> = ({
  letter
}) => <p className="listing-alphabet">{letter}</p>

interface CourseListItemProps {
  id: number
  name: string
  lastModified: Date | null
  onRename: (courseId: number, name: string) => void
}

interface MenuButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
}

const MenuButton: FunctionComponent<MenuButtonProps> = ({
  onClick,
  className
}) => {
  return (
    <button className={classnames('menu-button', className)} onClick={onClick}>
      <MoreVertIcon className="menu-button__icon" />
    </button>
  )
}

const CourseListItem: FunctionComponent<CourseListItemProps> = ({
  id,
  name,
  lastModified,
  children,
  onRename
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuCoords, setMenuCoords] = useState<
    { x: number; y: number } | undefined
  >(undefined)

  const handleRenameClicked = useCallback(() => {
    const newName = window.prompt(`Enter new name for course "${name}"`, name)
    if (!newName) {
      return
    }
    onRename(id, newName)
  }, [id, name, onRename])

  return (
    <li className="course-list-item">
      <FolderIcon className="course-list-item__icon" />
      <Link
        to={hrefToCourse(id, name)}
        className="course-list-item__link"
        title={name}
      >
        <span className="course-list-item__name">{name}</span>
      </Link>
      <p className="course-list-item__last-modified">
        {lastModified && formatDate(lastModified, 'YYYY-MM-DD hh:mm')}
      </p>
      <p className="course-list-item__menu-button">
        <MenuButton
          onClick={e => {
            e.preventDefault()
            setMenuCoords({ x: e.clientX, y: e.clientY })
            setMenuOpen(true)
          }}
        />
      </p>
      <CourseListMenu
        open={menuOpen}
        coordinates={menuCoords}
        onClose={() => setMenuOpen(false)}
        onRename={handleRenameClicked}
      />
      {children}
    </li>
  )
}

const CourseListHeader = () => (
  <div className="course-list-header">
    <p className="course-list-header__name">Course</p>
    <p className="course-list-header__last-modified">Last modified</p>
  </div>
)

function findFirstNamesOfStartingLetter(courseNames: Array<string>) {
  const firstNames = new Set<string>()
  let previous = courseNames[0].charAt(0)
  firstNames.add(courseNames[0])

  for (const courseName of courseNames) {
    const startingLetter = courseName.charAt(0)
    if (startingLetter === previous) continue
    previous = startingLetter
    firstNames.add(courseName)
  }

  return firstNames
}

interface CourseListProps extends WithClassName {
  courses: Array<CourseListingItem>
  onCourseRename: (id: number, name: string) => void
}

const CourseList: FunctionComponent<CourseListProps> = ({
  courses,
  onCourseRename,
  className
}) => {
  const sortedCourses = [...courses].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const firstNamesOfStartingLetter =
    sortedCourses.length > 0
      ? findFirstNamesOfStartingLetter(sortedCourses.map(_ => _.name))
      : new Set<string>()

  const shouldShowAlphabet = (courseName: string) =>
    firstNamesOfStartingLetter.has(courseName)

  const items = sortedCourses.map(course => (
    <CourseListItem
      key={course.id}
      id={course.id}
      name={course.name}
      lastModified={course.lastModified}
      onRename={onCourseRename}
    >
      {/* Show alphabets to the left of the listing */
      shouldShowAlphabet(course.name) ? (
        <ListingAlphabet letter={course.name.charAt(0).toLocaleUpperCase()} />
      ) : null}
    </CourseListItem>
  ))

  return (
    <div className={classnames('course-list', className)}>
      <CourseListHeader />
      <ul className="course-list__list">{items}</ul>
    </div>
  )
}

export default CourseList
