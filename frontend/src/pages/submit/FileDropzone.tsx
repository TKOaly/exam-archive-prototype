import React, { useCallback, FunctionComponent } from 'react'
import cls from 'classnames'
import { useDropzone } from 'react-dropzone'
import ArrowDownBoldIcon from './ArrowDownBoldIcon'
import './FileDropzone.scss'

const FIFTY_MB_TO_B = 50000000

const DropMessage = () => (
  <div className="drop-message">
    <ArrowDownBoldIcon className="drop-message__icon" />
    <div>
      <p className="drop-message__text">
        Choose file by dragging & dropping or by clicking here
      </p>
      <p className="drop-message__subtitle">
        One file only. Max file size 50 MB
      </p>
    </div>
  </div>
)

interface FileDropzoneProps {
  onFileSelected: (file: File) => void
  className?: string
}

export const FileDropzone: FunctionComponent<FileDropzoneProps> = ({
  onFileSelected,
  className
}) => {
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length !== 1) {
        // disallow multiple files
        return
      }

      onFileSelected(acceptedFiles[0])
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    multiple: false,
    maxSize: FIFTY_MB_TO_B,
    minSize: 1
  })

  return (
    <div
      {...getRootProps({
        className: cls('file-dropzone', className, {
          'file-dropzone--drag-active': isDragActive
        })
      })}
    >
      <input {...getInputProps()} />
      <DropMessage />
    </div>
  )
}

export default FileDropzone
