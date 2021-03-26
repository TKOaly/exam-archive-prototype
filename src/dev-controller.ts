import express from 'express'
import { AuthData } from './common'
import config from './config'
import {
  devApplyDevS3ExamPrefix,
  devGetS3Objects,
  devRemoveS3ExamPrefix
} from './service/dev'

const router = express.Router()

router.get('/', async (req, res) => {
  const auth = (req as any).auth as AuthData

  const objects = await devGetS3Objects()
  res.render('developer', {
    flash: req.flash(),
    username: auth.user.username,
    s3Objects: objects,
    s3DevPrefix: config.AWS_S3_DEV_PREFIX
  })
})

router.post('/apply-s3-dev-prefix', async (req, res) => {
  const devPrefix = req.body.devPrefix.replace(/\//g, '') // remove forward slashes from prefix
  await devRemoveS3ExamPrefix()

  if (!devPrefix) {
    req.flash('S3 dev prefix removed from exam file_paths.', 'info')
    return res.redirect('/dev')
  }

  await devApplyDevS3ExamPrefix(devPrefix)
  req.flash(`S3 dev prefix '${devPrefix}' applied to exam file_paths`, 'info')
  res.redirect('/dev')
})

export default router
