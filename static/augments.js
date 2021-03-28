function attachCourseRenameHandlers() {
  ;[...document.querySelectorAll('[data-rename-course-button]')].forEach(
    button => {
      button.addEventListener('click', e => {
        e.preventDefault()
        const { id, currentName } = button.dataset
        const res = prompt(
          `Please enter the new name for this course:`,
          currentName
        )
        if (!res) {
          return
        }

        const formData = new URLSearchParams()
        formData.append('name', res)

        return fetch(`/archive/rename-course/${encodeURI(id)}`, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        })
          .then(res => {
            if (res.status === 200) {
              location.reload()
              return
            }
            if (res.status === 404) {
              alert('Course not found!')
              return
            }
            alert('An error occurred.')
          })
          .catch(e => {
            console.error(e)
            alert('An error occurred.')
          })
      })
    }
  )
}

function attachExamRenameHandlers() {
  ;[...document.querySelectorAll('[data-rename-exam-button]')].forEach(
    button => {
      button.addEventListener('click', e => {
        e.preventDefault()
        const { id, currentName } = button.dataset
        const res = prompt(
          `Please enter the new filename for this exam:`,
          currentName
        )
        if (!res) {
          return
        }

        const formData = new URLSearchParams()
        formData.append('name', res)

        return fetch(`/archive/rename-exam/${encodeURI(id)}`, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        })
          .then(res => {
            if (res.status === 200) {
              location.reload()
              return
            }
            if (res.status === 404) {
              alert('Course not found!')
              return
            }
            alert('An error occurred.')
          })
          .catch(e => {
            console.error(e)
            alert('An error occurred.')
          })
      })
    }
  )
}

function attachExamDeleteConfirmationHandlers() {
  ;[...document.getElementsByClassName('delete-exam-button')].forEach(
    deleteForm => {
      const handler = e => {
        if (!confirm('Are you sure you want to delete this exam?')) {
          e.preventDefault()
          return false
        }

        return true
      }
      deleteForm.addEventListener('submit', handler)
    }
  )
}

attachCourseRenameHandlers()
attachExamRenameHandlers()
attachExamDeleteConfirmationHandlers()
