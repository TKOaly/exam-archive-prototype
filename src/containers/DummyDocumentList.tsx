import React from 'react'
import dummyCourses from '../data/courses.json'
import DocumentList from '../components/DocumentList'
import NotFound from '../components/NotFound'
import { deserialize } from './deserializer'

const DummyDocumentList = ({
  match
}: {
  match: { params: { courseName: string } }
}) => {
  const courses = deserialize(dummyCourses)
  const requestedCourse = match.params.courseName
  const matchingCourse = courses.find(course => course.name === requestedCourse)
  if (!matchingCourse) return <NotFound />

  return <DocumentList documents={matchingCourse.documents} />
}

export default DummyDocumentList
