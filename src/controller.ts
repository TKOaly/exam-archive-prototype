import express from 'express'
import bodyParser from 'body-parser'
import slugify from 'slugify'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { transliterate } from 'transliteration'
import contentDisposition from 'content-disposition'
import { v4 as uuidv4 } from 'uuid'

import config from './config'
import {
  getCourseListing,
  getCourseInfo,
  deleteCourse,
  deleteExam,
  CourseNotFoundError,
  CannotDeleteError,
  findCourseByExamId,
  findCourseByName,
  createExam,
  createCourse,
  renameCourse,
  getExamFileNameById,
  renameExamFile
} from './service/archive'
import s3 from './service/s3'
import { AuthData, requireRights } from './common'
import devRouter from './dev-controller'

const slugifyCourseName = (courseName: string) => {
  return slugify(courseName.replace(/c\+\+/i, 'cpp'), {
    lower: true,
    replacement: '-',
    remove: /[^\w\d \-]/g
  })
}

const applyDevPrefix = (objectName: string) =>
  config.AWS_S3_DEV_PREFIX
    ? `${config.AWS_S3_DEV_PREFIX}/${objectName}`
    : objectName

const upload = multer({
  storage: multerS3({
    s3,
    bucket: config.AWS_S3_BUCKET_ID,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'private',
    key: (
      req: any,
      file: Express.MulterS3.File,
      cb: (err: any, key: string) => void
    ) => {
      const id = uuidv4()
      cb(null, applyDevPrefix(id))
    },
    contentDisposition: (
      req: any,
      file: Express.MulterS3.File,
      cb: (err: any, key: string) => void
    ) => {
      cb(
        null,
        contentDisposition(file.originalname, {
          type: 'inline',
          fallback: transliterate(file.originalname)
        })
      )
    }
  } as any)
})

const router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))

if (config.NODE_ENV === 'development') {
  router.use('/dev', devRouter)
}

router.get('/', (req, res) => {
  res.redirect('/archive')
})

const urlForCourse = (id: number, name: string) =>
  `/archive/${id}-${slugifyCourseName(name)}`

router.get('/archive', async (req, res) => {
  const list = await getCourseListing()

  const auth = (req as any).auth as AuthData
  res.render('index', {
    flash: req.flash(),
    courses: list
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name, lastModified }) => ({
        id,
        name,
        lastModified,
        url: urlForCourse(id, name)
      })),
    userRights: auth.rights,
    username: auth.user.username
  })
})

router.post('/archive', requireRights('upload'), async (req, res) => {
  const { courseName } = req.body

  const existingCourse = await findCourseByName(courseName.trim())
  if (existingCourse) {
    req.flash(`Course ${existingCourse.name} already exists!`, 'error')
    return res.redirect('/')
  }

  const createdCourse = await createCourse({ name: courseName })
  req.flash(`Course "${createdCourse?.name ?? courseName}" created!`, 'info')
  res.redirect(
    createdCourse ? urlForCourse(createdCourse.id, createdCourse.name) : '/'
  )
})

const examDownloadUrl = (examId: number, fileName: string) =>
  `/download/${examId}/${fileName}`

router.get('/archive/:id(\\d+)-?:courseSlug?', async (req, res, next) => {
  const { id: unparsedId, courseSlug } = req.params

  const id = parseInt(unparsedId, 10)
  if (isNaN(id)) {
    return next()
  }

  const course = await getCourseInfo(id)
  if (course === null) {
    return next()
  }

  if (courseSlug !== slugifyCourseName(course.name)) {
    return res.redirect(302, urlForCourse(course.id, course.name))
  }

  const auth = (req as any).auth as AuthData

  res.render('course', {
    flash: req.flash(),
    course,
    exams: course.exams.map(exam => ({
      ...exam,
      downloadUrl: examDownloadUrl(exam.id, exam.fileName)
    })),
    previousPageUrl: '/archive',
    userRights: auth.rights,
    username: auth.user.username
  })
})

router.post(
  '/archive/upload',
  requireRights('upload'),
  upload.single('file'),
  async (req, res, next) => {
    const file = req.file as Express.MulterS3.File
    console.log(file)
    const deleteFile = async () => {
      try {
        await s3.deleteObject({ Bucket: file.bucket, Key: file.key }).promise()
      } catch (e) {
        console.error('Failed to delete uploaded object from S3', e)
      }
    }

    const id = parseInt(req.body.course_id, 10)
    if (isNaN(id)) {
      await deleteFile()
      req.flash(
        `Cannot upload a file to a course that does not exist.`,
        'error'
      )
      return res.redirect('/')
    }

    const course = await getCourseInfo(id)
    if (course === null) {
      await deleteFile()
      req.flash(
        `Cannot upload a file to a course that does not exist.`,
        'error'
      )
      return res.redirect('/')
    }

    try {
      await createExam({
        course_id: course.id,
        file_name: file.originalname,
        file_path: file.key,
        mime_type: file.contentType
      })
    } catch (e) {
      await deleteFile()
      req.flash(
        'An error occurred while saving the file. Please try again.',
        'error'
      )
      return res.redirect(urlForCourse(course.id, course.name))
    }

    req.flash(`Exam ${file.originalname} created!`, 'info')
    res.redirect(urlForCourse(course.id, course.name))
  }
)

router.post(
  `/archive/rename-exam/:examId(\\d+)`,
  requireRights('rename'),
  async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: 'name missing' })
      }

      const examId = parseInt(req.params.examId, 10)
      if (isNaN(examId)) {
        return res.status(404).json({ error: 'invalid exam id' })
      }

      const oldName = await getExamFileNameById(examId)

      if (oldName === null) {
        return res.status(404).json({ error: 'exam not found' })
      }

      const updatedExam = await renameExamFile(examId, req.body.name)
      if (updatedExam === null) {
        console.error(
          new Error(`Exam renaming didn't update any exams! Exam ID: ${examId}`)
        )
        return res.status(500).json({ error: 'error' })
      }

      // To change the Content Disposition header on S3, we need to make a copy of the
      // object
      const s3key = updatedExam.filePath
      try {
        await s3
          .copyObject({
            CopySource: `${config.AWS_S3_BUCKET_ID}/${s3key}`,
            Bucket: config.AWS_S3_BUCKET_ID,
            Key: s3key,
            ACL: 'private',
            ContentType: updatedExam.mimeType,
            ContentDisposition: contentDisposition(updatedExam.fileName, {
              type: 'inline',
              fallback: transliterate(updatedExam.fileName)
            }),
            MetadataDirective: 'REPLACE'
          })
          .promise()
      } catch (e) {
        // s3 failed! revert!
        await renameExamFile(examId, oldName)
        console.error('S3 rename failed!', e)
        throw e
      }

      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    }
  }
)

router.post(
  '/archive/delete-exam/:examId(\\d+)',
  requireRights('remove'),
  async (req, res) => {
    try {
      const course = await findCourseByExamId(parseInt(req.params.examId, 10))

      if (!course) {
        req.flash(`Exam does not exist.`, 'error')
        return res.redirect('/')
      }

      await deleteExam(parseInt(req.params.examId, 10))
      // don't delete from S3, purge S3 objects with no references separately via admin panel
      // also, TODO admin panel lol!
      req.flash(`Exam has been deleted.`, 'info')
      return res.redirect(urlForCourse(course.id, course.name))
    } catch (e) {
      console.error(e)
      req.flash(
        `An error occurred while deleting the exam. Please try again.`,
        'error'
      )
      return res.redirect('/')
    }
  }
)

router.post(
  '/archive/delete-course/:courseId(\\d+)',
  requireRights('remove'),
  async (req, res) => {
    try {
      const deletedCourse = await deleteCourse(
        parseInt(req.params.courseId, 10)
      )
      req.flash(`The course "${deletedCourse?.name}" has been deleted.`, 'info')
      return res.redirect('/archive')
    } catch (e) {
      // TODO: show flash messages
      if (e instanceof CourseNotFoundError || e instanceof CannotDeleteError) {
        req.flash(e.message, 'error')
        return res.redirect('/')
      }
      req.flash('An error occurred while deleting the course.', 'error')
      res.redirect('/')
    }
  }
)

router.post(
  `/archive/rename-course/:courseId(\\d+)`,
  requireRights('rename'),
  async (req, res) => {
    try {
      const course = await getCourseInfo(parseInt(req.params.courseId, 10))
      if (!course) {
        return res.status(404).json({ error: 'course not found' })
      }

      if (!req.body.name) {
        return res.status(400).json({ error: 'name missing' })
      }

      await renameCourse(course.id, req.body.name)
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    }
  }
)

export default router
