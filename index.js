const addBookBtn = document.querySelector('button.add-book');
const addBookForm = document.querySelector('form.add-book');
const submitAddBook = document.querySelector("form.add-book button[type='submit']")
const cancelAddBook = document.querySelector("form.add-book button.cancel")

addBookBtn.addEventListener('click', () => {
    addBookForm.classList.add('show');
    addBookBtn.classList.add('hide');
})

cancelAddBook.addEventListener('click', () => {
    addBookForm.classList.remove('show');
    addBookBtn.classList.remove('hide');
})

