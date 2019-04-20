import React from 'react'
import CourseList from './CourseList'
import ListingNavigation from '../common/ListingNavigation'
import { WithClassName } from '../common/WithClassName'
import { CourseListingItem } from '../../domain'
import './CourseListPage.scss'

interface CourseListPageState {
  courses: Array<CourseListingItem>
}

class CourseListPage extends React.Component<
  WithClassName,
  CourseListPageState
> {
  state = {
    courses: []
  }

  async componentDidMount() {
    const res = await fetch('/api/courses')
    const courses = await res.json()
    this.setState({ courses })
  }

  render() {
    return (
      <>
        <ListingNavigation title="Courses" />
        <main className="course-list-page">
          <CourseList courses={this.state.courses} />
        </main>
      </>
    )
  }
}

export default CourseListPage
