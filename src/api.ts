import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import {
  renameCourse,
  getCourseListing,
  getCourseInfo,
  findCourseById,
  createExam
} from './service/archive'

const courseNotFound = (res: Response) => (attemptedCourseId: any) =>
  res.status(404).json({
    error: `Course "${attemptedCourseId}" not found`
  })

const api = express.Router()

api.get('/courses', async (req, res) => {
  const courses = await getCourseListing()
  res.json(courses)
})

interface CourseIdLocals {
  locals?: {
    courseId: number
  }
}

api.param('courseId', (req: Request & CourseIdLocals, res, next, courseId) => {
  const parsedCourseId = parseInt(req.params.courseId, 10)

  if (isNaN(parsedCourseId)) {
    return courseNotFound(res)(req.params.courseId)
  }

  req.locals = { ...req.locals, courseId }
  next()
})

api.get(
  '/courses/:courseId',
  async (req: Request & CourseIdLocals, res, next) => {
    const course = await getCourseInfo(req.locals!.courseId)
    if (course === null) {
      return next()
    }
    res.json(course)
  }
)

api.post(
  '/courses/:courseId/rename',
  bodyParser.json(),
  async (req: Request & CourseIdLocals, res, next) => {
    const { name } = req.body
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name missing' })
    }

    await renameCourse(req.locals!.courseId, name)
    res.status(200).end()
  }
)

api.post(
  '/courses/:courseId/exams',
  async (req: Request & CourseIdLocals, res, next) => {
    throw new Error('not impl')
    /*const course = await findCourseById(req.locals!.courseId)

    if (!course) {
      return courseNotFound(res)(req.locals!.courseId)
    }

    const createdFile = await createExam({
      course_id: course.id,
      file_name: req.body.fileName,
      mime_type: req.file.mimetype,
      file_path: req.file.filename
    })

    return res.status(201).json(createdFile)*/
  }
)

api.use('*', (req, res, next) => res.status(404).json({ error: 'not found' }))

export default api
