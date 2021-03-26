import AWS from 'aws-sdk'
import config from '../config'

if (config.NODE_ENV === 'development') {
  AWS.config.update({
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID!,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY!
    }
  })
} else {
  AWS.config.update({
    region: config.AWS_REGION
  })
}

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

export default s3
