import React, { FunctionComponent, useState, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import classnames from 'classnames'
import Link from 'next/link'
import formatDate from 'date-fns/format'
import { motion } from 'framer-motion'

import { CourseListingItem } from '../../domain'
import { transitions } from '../animations'
import MoreVertIcon from '../MoreVertIcon'
import { WithClassName } from '../WithClassName'
import { hrefToCourse } from '../utils'
import FolderIcon from './FolderIcon'
import CourseListMenu from './CourseListMenu'
import './CourseList.scss'

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

interface CourseListItemProps {
  id: number
  name: string
  lastModified: Date | null
  // onRename: (courseId: number, name: string) => void
  onMenuClicked: (id: number, coords: { x: number; y: number }) => void
}

const CourseListItem: FunctionComponent<CourseListItemProps> = ({
  id,
  name,
  lastModified,
  onMenuClicked
}) => {
  const handleMenuClicked = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      onMenuClicked(id, { x: e.clientX, y: e.clientY })
    },
    [id, onMenuClicked]
  )
  const href = hrefToCourse(id, name)

  return (
    <li className="course-list-item">
      <FolderIcon className="course-list-item__icon" />
      <Link href="/courses/[id-slug]" as={href} scroll={false}>
        <a title={name} className="course-list-item__link">
          <span className="course-list-item__name">{name}</span>
        </a>
      </Link>
      <p className="course-list-item__last-modified">
        {lastModified && formatDate(lastModified, 'YYYY-MM-DD hh:mm')}
      </p>
      <p className="course-list-item__menu-button">
        <MenuButton onClick={handleMenuClicked} />
      </p>
    </li>
  )
}

const CourseListHeader = () => (
  <div className="course-list-header">
    <p className="course-list-header__name">Course</p>
    <p className="course-list-header__last-modified">Last modified</p>
  </div>
)

interface CourseListProps extends WithClassName {
  courses: Array<CourseListingItem>
  onCourseRename: (id: number, name: string) => void
}

interface AcualListProps {
  courses: Array<CourseListingItem>
  onMenuClicked: (id: number, coords: { x: number; y: number }) => void
}

const AcualList: FunctionComponent<AcualListProps> = ({
  courses,
  onMenuClicked
}) => {
  const items = courses.map(function makeCourseListItem(course) {
    return (
      <CourseListItem
        key={course.id}
        id={course.id}
        name={course.name}
        lastModified={course.lastModified}
        onMenuClicked={onMenuClicked}
      />
    )
  })

  return <ul className="course-list__list">{items}</ul>
}

const variants = {
  initial: { y: 30, opacity: 0 },
  enter: {
    y: 0,
    opacity: 1,
    transition: transitions.in
  },
  exit: {
    y: -30,
    opacity: 0,
    transition: transitions.out
  }
}

const CourseList: FunctionComponent<CourseListProps> = ({
  courses,
  onCourseRename,
  className
}) => {
  const [menuOpenItemId, setMenuOpenItemId] = useState<number | undefined>()
  const [menuCoords, setMenuCoords] = useState<
    { x: number; y: number } | undefined
  >(undefined)

  const handleRenameClicked = useCallback(() => {
    if (menuOpenItemId === undefined) {
      return false
    }

    const course = courses.find(c => c.id === menuOpenItemId)
    if (!course) {
      return
    }

    const newName = window.prompt(
      `Enter new name for course "${course.name}"`,
      course.name
    )
    if (!newName) {
      return
    }

    onCourseRename(menuOpenItemId, newName)
  }, [menuOpenItemId, onCourseRename])

  const handleMenuClicked = useCallback((id, coords) => {
    setMenuCoords(coords)
    setMenuOpenItemId(id)
  }, [])

  return (
    <div
      className={classnames('course-list', className)}
      style={{ height: `${courses.length * (48 + 1)}px` }}
    >
      <motion.div key="course-list-header" variants={variants}>
        <CourseListHeader />
      </motion.div>
      <CourseListMenu
        open={menuOpenItemId !== undefined}
        coordinates={menuCoords}
        onClose={() => setMenuOpenItemId(undefined)}
        onRename={handleRenameClicked}
      />

      <motion.div
        key="course-list__list"
        className="course-list__list"
        variants={variants}
      >
        <AcualList courses={courses} onMenuClicked={handleMenuClicked} />
      </motion.div>
    </div>
  )
}

export default CourseList
