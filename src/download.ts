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

const createSignedCookie = (exam: DbExam) =>
  new Promise<AWS.CloudFront.Signer.CannedPolicy>((resolve, reject) => {
    cfSigner.getSignedCookie(getCfSigningOptions(exam), (err, cookieOpts) =>
      err ? reject(err) : resolve(cookieOpts)
    )
  })

const applySignedCookie = async (exam: DbExam, res: express.Response) => {
  const cookie = await createSignedCookie(exam)
  const setCookie = (key: string, value: string | number) => {
    res.cookie(key, value, {
      domain: '.tko-aly.fi',
      maxAge: new Date().getTime() + oneHourToSeconds * 1000,
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict'
    })
  }

  for (const key of [
    'CloudFront-Expires',
    'CloudFront-Key-Pair-Id',
    'CloudFront-Signature'
  ] as const) {
    setCookie(key, cookie[key])
  }
}

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

  // only use signed cookies instead of signed urls because
  // local dev isn't running under the *.tko-aly.fi domain, so
  // the cookies can't be applied to the correct domain
  if (config.AWS_CF_USE_SIGNED_COOKIES) {
    const url = getCloudFrontUrl(exam)
    await applySignedCookie(exam, res)
    res.redirect(url)
  } else {
    const url = await createSignedUrl(exam)
    res.redirect(url)
  }
})

export default router
