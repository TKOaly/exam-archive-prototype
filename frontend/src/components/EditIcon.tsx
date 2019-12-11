import React from 'react'
import { Icon } from './Icon'

const EditIcon: Icon = ({ alt, className }) => (
  <img
    className={className}
    alt={alt}
    src="/img/icon-edit.svg"
  />
)

export default EditIcon
