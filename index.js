const addBookBtn = document.querySelector('button.add-book');
const addBookForm = document.querySelector('form.add-book');
const submitAddBook = document.querySelector("form.add-book button.submit")
const cancelAddBook = document.querySelector("form.add-book button.cancel")

// Add-book form fields
const titleField = document.getElementById('title');
const authorField = document.getElementById('author');
const ratingField = document.getElementById('rating');
const dateReadField = document.getElementById('date-read');


addBookBtn.addEventListener('click', () => {
    addBookForm.classList.add('show');
    addBookBtn.classList.add('hide');
    titleField.focus();
})

cancelAddBook.addEventListener('click', () => {
    addBookForm.classList.remove('show');
    addBookBtn.classList.remove('hide');
    // Clear fields
    addBookForm.reset();
})


// Book object factory function
function Book(title, author, rating, dateRead) {
    const fullTitle = `'${title}' by ${author}`;
    return { title, author, rating, dateRead, fullTitle };
}

// Initialize empty books array in local storage 
if (localStorage.getItem('books') === null) {
    const books = [];
    localStorage.setItem('books', JSON.stringify(books));    
}

const libraryTable = document.querySelector('table.library tbody');

function addBook(book) {
    const books = JSON.parse(localStorage.getItem('books'));
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
}

function renderTable() {
    const books = JSON.parse(localStorage.getItem('books'));
    
    if (books.length === 0) {
        return;
    }

    libraryTable.innerHTML = '';
    books.forEach(book => {
        const bookEntry = document.querySelector('template.book-entry').content.cloneNode(true);
        
        bookEntry.querySelector('td.title').textContent = book.title;
        bookEntry.querySelector('td.author').textContent = book.author;
        bookEntry.querySelector('td.rating').textContent = book.rating;
        bookEntry.querySelector('td.date-read').textContent = book.dateRead;
        
        libraryTable.appendChild(bookEntry);
    }); 
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
})

// Add book
submitAddBook.addEventListener('click', () => {
    const title = titleField.value;
    const author = authorField.value;
    const rating = ratingField.value;
    const dateRead = dateReadField.value;

    const book = Book(title, author, rating, dateRead);
    addBook(book);
    renderTable();
})

// Edit book
const editButtons = document.querySelectorAll('button.edit');
editButtons.forEach((editButton, index) => {
    editButton.addEventListener('click', () => {
        const books = JSON.parse(localStorage.getItem('books'));
        const targetBook = books[index];

        const editForm = document.querySelector('form.edit-book');
        editForm.classList.toggle('show');

        const titleField = editForm.getElementById('edit-title')
        const authorField = editForm.getElementsById('edit-author')
        const ratingField = editForm.getElementById('edit-rating');
        const currentRatingOption = editForm.querySelector(`option[value="${targetBook.rating}"]`)
        const dateField = editForm.getElementById('edit-date-read')

        // Pre-fill in each form field with current data of book
        titleField.value = targetBook.title;
        authorField.value = targetBook.author;
        currentRatingOption.setAttribute('selected', 'selected');
        dateField.value = targetBook.dateRead;

        const saveBtn = editForm.querySelector('button.save');
        const removeBtn = editForm.querySelector('button.remove');
        const cancelBtn = editForm.querySelector('button.cancel');

        // Save changes
        saveBtn.addEventListener('click', () => {
            targetBook.title = titleField.value;
            targetBook.author = authorField.value;
            targetBook.rating = ratingField.value;
            targetBook.dateRead = dateField.value;
        })

        // Remove book
        removeBtn.addEventListener('click', () => {
            books.splice(index, 1);
        })
    })
})
