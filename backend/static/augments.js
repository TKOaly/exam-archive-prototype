;[
  ...document.getElementsByClassName('course-table-row__rename-button')
].forEach(button => {
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
})
