import express from 'express'
import fs from 'fs'
import contentDisposition from 'content-disposition'
import { transliterate } from 'transliteration'
import { findExamById } from './service/archive'

const router = express()

router.get('/:examId/:fileName', async (req, res) => {
  // fileName actually not used, just looks nicer to the user
  const examId = parseInt(req.params.examId, 10)

  if (isNaN(examId)) {
    return res.status(404).send('404')
  }

  const exam = await findExamById(examId)
  if (!exam) {
    return res.status(404).send('404')
  }

  const stream = fs.createReadStream(exam.file_path)

  stream.once('error', (err: any) => {
    const errMsg = `Error occurred while opening exam ${exam.id}'s file "${
      exam.file_path
    }" for download!`
    console.error(errMsg, err)
    res.status(500).send('Internal server error')
  })

  stream.once('open', () => {
    res.setHeader(
      'Content-Disposition',
      contentDisposition(exam.file_name, {
        type: 'inline',
        fallback: transliterate(exam.file_name)
      })
    )
    res.setHeader('Content-Type', exam.mime_type)
    stream.pipe(res)
  })
})

export default router
