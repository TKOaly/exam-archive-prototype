import React, { useCallback } from 'react'
import fetch from 'isomorphic-unfetch'
import { NextPage } from 'next'
import { motion, MotionAdvancedProps } from 'framer-motion'

import CourseList from '../../components/courses/CourseList'
import ListingNavigation from '../../components/ListingNavigation'
import { CourseListingItem } from '../../domain'
import { makeUrl } from '../../api'
import './index.scss'

interface Props {
  courses: Array<CourseListingItem>
}

const CourseListPage: NextPage<Props> = ({ courses }) => {
  const handleCourseRename = useCallback(
    async (id: number, name: string) => {
      const oldCourse = courses.find(course => course.id === id)
      if (!oldCourse) {
        return
      }

      await fetch(`/api/courses/${id}/rename`, {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: {
          Accept: 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      window.location.reload()
    },
    [courses]
  )

  return (
    <motion.div
      key="course-list-container"
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <ListingNavigation title="Courses" />
      <main className="course-list-page">
        <CourseList courses={courses} onCourseRename={handleCourseRename} />
      </main>
    </motion.div>
  )
}

let cache: CourseListingItem[] | null = null

CourseListPage.getInitialProps = async () => {
  if (cache) {
    return { courses: cache }
  }

  const res = await fetch(makeUrl('/api/courses'), {
    headers: {
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json; charset=utf-8'
    }
  })

  const courses: CourseListingItem[] = await res.json()
  courses.sort((a, b) => a.name.localeCompare(b.name, 'fi-FI'))
  cache = courses
  return { courses: cache }
}

export default CourseListPage
