import React from 'react'
import CourseList from '../components/CourseList'
import courses from '../data/courses.json'
import { deserialize } from './deserializer'

const DummyCourseList = () => <CourseList courses={deserialize(courses)} />

export default DummyCourseList
