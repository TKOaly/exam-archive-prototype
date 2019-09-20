import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback
} from 'react'
import CourseList from './CourseList'
import ListingNavigation from '../common/ListingNavigation'
import { CourseListingItem } from '../../domain'
import './CourseListPage.scss'

const CourseListPage: FunctionComponent = () => {
  const [courses, setCourses] = useState<Array<CourseListingItem>>([])

  const fetchCourses = async () => {
    const res = await fetch('/api/courses')
    const courses = await res.json()
    setCourses(courses)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

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

      fetchCourses()
    },
    [courses]
  )

  return (
    <>
      <ListingNavigation title="Courses" />
      <main className="course-list-page">
        <CourseList courses={courses} onCourseRename={handleCourseRename} />
      </main>
    </>
  )
}

export default CourseListPage
