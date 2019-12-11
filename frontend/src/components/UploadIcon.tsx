import React from 'react'
import classnames from 'classnames'
import { Icon } from './Icon'

const UploadIcon: Icon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    className={classnames('upload-icon', className)}
  >
    <path d="M9,10V16H15V10H19L12,3L5,10H9M12,5.8L14.2,8H13V14H11V8H9.8L12,5.8M19,18H5V20H19V18Z" />
  </svg>
)

export default UploadIcon
