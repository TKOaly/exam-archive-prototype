import express, { Request, Response } from 'express'
import multer from 'multer'
import config from './config'
import {
  getCourseListing,
  getCourseInfo,
  findCourseById,
  createExam
} from './service/archive'

const FIFTY_MB_TO_B = 50000000

const courseNotFound = (res: Response) => (attemptedCourseId: any) =>
  res.status(404).json({
    error: `Course "${attemptedCourseId}" not found`
  })

const api = express.Router()

const upload = multer({
  dest: config.ARCHIVE_FILE_DIR,
  limits: {
    files: 1,
    fileSize: FIFTY_MB_TO_B
  }
})

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
  '/courses/:courseId/exams',
  upload.single('exam'),
  async (req: Request & CourseIdLocals, res, next) => {
    const course = await findCourseById(req.locals!.courseId)

    if (!course) {
      return courseNotFound(res)(req.locals!.courseId)
    }

    const createdFile = await createExam({
      course_id: course.id,
      file_name: req.body.fileName,
      mime_type: req.file.mimetype,
      file_path: req.file.filename
    })

    return res.status(201).json(createdFile)
  }
)

export default api
