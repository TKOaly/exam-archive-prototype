import express from 'express'
import fs from 'fs'
import util from 'util'
import path from 'path'
import contentDisposition from 'content-disposition'
import { transliterate } from 'transliteration'

import config from './config'
import { findExamById } from './service/archive'

const statAsync = util.promisify(fs.stat)

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

  const filePath = path.join(config.ARCHIVE_FILE_DIR, exam.file_path)
  const { mtime } = await statAsync(filePath)

  const stream = fs.createReadStream(filePath)

  stream.once('error', (err: any) => {
    const errMsg = `Error occurred while opening exam ${
      exam.id
    }'s file "${filePath}" for download!`
    console.error(errMsg, err)
    res.status(500).send('Internal server error')
  })

  stream.once('open', () => {
    res.set({
      'Content-Disposition': contentDisposition(exam.file_name, {
        type: 'inline',
        fallback: transliterate(exam.file_name)
      }),
      'Content-Type': exam.mime_type,
      'Last-Modified': mtime.toUTCString(),
      'Cache-Control': 'private, max-age=86400'
    })
    stream.pipe(res)
  })
})

export default router
