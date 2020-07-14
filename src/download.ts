import express from 'express'
import AWS from 'aws-sdk'

import config from './config'
import { findExamById } from './service/archive'
import { DbExam } from './db'

const cfSigner = new AWS.CloudFront.Signer(
  config.AWS_CF_KEY_ID,
  config.AWS_CF_KEY
)

// age in seconds
const oneHourToSeconds = 60 * 60 * 1

const getCloudFrontUrl = (exam: DbExam) =>
  `https://${config.AWS_CF_DISTRIBUTION_DOMAIN}/${exam.file_path}`

const getCfSigningOptions = (
  exam: DbExam
): AWS.CloudFront.Signer.SignerOptionsWithoutPolicy => ({
  expires: Math.floor(new Date().getTime() / 1000) + oneHourToSeconds,
  url: getCloudFrontUrl(exam)
})

const createSignedUrl = (exam: DbExam) =>
  new Promise<string>((resolve, reject) => {
    cfSigner.getSignedUrl(getCfSigningOptions(exam), (err, url) =>
      err ? reject(err) : resolve(url)
    )
  })

const router = express()

router.get('/:examId/:fileName', async (req, res, next) => {
  // fileName actually not used, just looks nicer to the user
  const examId = parseInt(req.params.examId, 10)

  if (isNaN(examId)) {
    return res.status(404).send('404')
  }

  const exam = await findExamById(examId)
  if (!exam) {
    return res.status(404).send('404')
  }

  const url = await createSignedUrl(exam)
  res.redirect(url)
})

export default router
