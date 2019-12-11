import React from 'react'
import { Icon } from './Icon'

export const DocumentIcon: Icon = ({ alt, className }) => (
  <img className={className} alt={alt} src="/img/icon-document.svg" />
)

export const PhotoIcon: Icon = ({ alt, className }) => (
  <img className={className} alt={alt} src="/img/icon-photo.svg" />
)

export const PdfIcon: Icon = ({ alt, className }) => (
  <img className={className} alt={alt} src="/img/icon-pdf.svg" />
)
