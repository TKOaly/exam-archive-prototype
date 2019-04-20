import React from 'react'
import CourseList from './CourseList'
import { Course } from '../../domain'

type CourseListPageState = {
  courses: Array<Course>
}

class CourseListPage extends React.Component<{}, CourseListPageState> {
  state = {
    courses: []
  }

  async componentDidMount() {
    const res = await fetch('/api/courses')
    const courses = await res.json()
    this.setState({ courses })
  }

  render() {
    return <CourseList courses={this.state.courses} />
  }
}

export default CourseListPage
