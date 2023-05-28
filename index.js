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


const library = new function () {
    this.table = document.querySelector('table.library tbody');

    this.shelfNum = 0;
    this.shelfSize = 10; // Number of books displayed per table page
    
    this.numShelves = (() => {
        const books = JSON.parse(localStorage.getItem('books'));
        return books.length % this.shelfSize === 0
                ? books.length / this.shelfSize
                : books.length < this.shelfSize
                ? 1
                : Math.floor(books.length / this.shelfSize) + 1;
    })();

    this.addBook = book => {
        const books = JSON.parse(localStorage.getItem('books'));
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
    };

    this.renderTable = () => {
        const books = JSON.parse(localStorage.getItem('books'));

        if (books.length === 0) {
            return;
        }

        this.table.innerHTML = '';

        const currentBooks = books.slice(this.shelfNum * this.shelfSize,
            this.shelfNum * this.shelfSize + this.shelfSize);

        currentBooks.forEach((book, index) => {
            const bookEntry = document.querySelector('template.book-entry').content.cloneNode(true);

            bookEntry.querySelector('td.index').textContent = index + this.shelfNum * this.shelfSize + 1;
            bookEntry.querySelector('td.title').textContent = book.title;
            bookEntry.querySelector('td.author').textContent = book.author;
            bookEntry.querySelector('td.rating span.rating').textContent = book.rating;
            bookEntry.querySelector('td.date-read').textContent = book.dateRead;

            this.table.appendChild(bookEntry);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    library.renderTable();
})

// Add book
addBookForm.addEventListener('submit', event => {
    event.preventDefault(); // Prevent page refresh

    const title = titleField.value;
    const author = authorField.value;
    const rating = ratingField.value;
    const dateRead = dateReadField.value;

    const book = Book(title, author, rating, dateRead);
    library.addBook(book);
    library.renderTable();

    addBookForm.classList.remove('show');
    addBookBtn.classList.remove('hide');
    // Clear fields
    addBookForm.reset();
})


// Edit book entry 
// Use event delegation to bind event listener to table instead of binding directly to edit buttons 
library.table.addEventListener('click', event => {
    if (event.target.tagName !== 'BUTTON' || !event.target.classList.contains('edit')) {
        return;
    }
    // The following code will only run if clicked element is an edit-book button

    const tableRow = event.target.parentElement.parentElement;
    const index = tableRow.querySelector('td.index').textContent - 1;
    const books = JSON.parse(localStorage.getItem('books'));
    const targetBook = books[index];

    const editModal = document.querySelector('div.edit-book');
    const editForm = document.querySelector('form.edit-book');
    editModal.classList.add('show');

    const titleField = document.getElementById('edit-title')
    const authorField = document.getElementById('edit-author')
    const ratingField = document.getElementById('edit-rating');
    const currentRatingOption = editForm.querySelector(`option[value="${targetBook.rating}"]`)
    const dateField = document.getElementById('edit-date-read')

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

        books[index] = targetBook;

        localStorage.setItem('books', JSON.stringify(books));
        library.renderTable();
        editModal.classList.remove('show');
    })

    // Remove book
    removeBtn.addEventListener('click', () => {
        books.splice(index, 1);

        localStorage.setItem('books', JSON.stringify(books));
        library.renderTable();
        editModal.classList.remove('show');
    })

    // Cancel edit
    cancelBtn.addEventListener('click', () => {
        editModal.classList.remove('show');
    })
})


const prevBtn = document.querySelector('div.table-nav button.prev');
const nextBtn = document.querySelector('div.table-nav button.next');

nextBtn.addEventListener('click', () => {
    if (library.shelfNum === library.numShelves - 1) { // Cannot go to next shelf if already at last shelf
        return;
    }

    const books = JSON.parse(localStorage.getItem('books'));
    library.shelfNum += 1;
    library.renderTable();
})

prevBtn.addEventListener('click', () => {
    if (library.shelfNum === 0) { // Cannot go to previous shelf if already at first shelf
        return;
    }

    const books = JSON.parse(localStorage.getItem('books'));
    library.shelfNum -= 1;
    library.renderTable();
})
