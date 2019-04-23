import React, { FunctionComponent } from 'react'
import { ChipSet, Chip } from '@material/react-chips'
import '@material/react-chips/dist/chips.css'
import FileDropzone from './FileDropzone'
import CloseIcon from './CloseIcon'

interface FileSelectionProps {
  selectedFile: File | undefined
  onFileSelected: (file: File | undefined) => void
}

const FileSelection: FunctionComponent<FileSelectionProps> = ({
  selectedFile,
  onFileSelected
}) => {
  return selectedFile ? (
    <ChipSet choice handleSelect={() => onFileSelected(undefined)}>
      <Chip
        id={selectedFile.name}
        label={selectedFile.name}
        trailingIcon={<CloseIcon />}
      />
    </ChipSet>
  ) : (
    <FileDropzone onFileSelected={onFileSelected} />
  )
}

export default FileSelection
