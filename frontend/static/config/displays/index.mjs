export function main () {
    for (const deleteButton of document.querySelectorAll(
      'button.delete-display'
    )) {
      deleteButton.addEventListener('click', async () => {
        if (window.confirm('Are you sure you want to delete this display?')) {
          const deptId = deleteButton.dataset.departmentId
          const id = deleteButton.dataset.displayId
          const res = await fetch(`/api/departments/${deptId}/displays/${id}`, {
            method: 'delete'
          })
  
          if (res.status !== 200) {
            window.alert('Error deleting display')
          } else {
            deleteButton.closest('.display-entry').remove()
          }
        }
      })
    }
  }