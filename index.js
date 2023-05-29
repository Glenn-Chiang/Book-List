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
function Book(title, author, rating, dateRead, status) {
    return { title, author, rating, dateRead, status };
}

// Initialize empty books array in local storage 
if (localStorage.getItem('books') === null) {
    const books = [];
    localStorage.setItem('books', JSON.stringify(books));
}


const library = new function () {
    this.table = document.querySelector('table.library tbody');

    this.shelfSize = 10; // Number of books displayed per table page
    
    this.numShelves = () => {
        const books = JSON.parse(localStorage.getItem('books'));
        return books.length % this.shelfSize === 0
                ? books.length / this.shelfSize
                : books.length < this.shelfSize
                ? 1
                : Math.floor(books.length / this.shelfSize) + 1;
    };

    // Display latest shelf when page is first loaded
    this.shelfNum = this.numShelves() - 1;

    this.bookCapacity = this.shelfSize * this.numShelves;

    this.addBook = book => {
        const books = JSON.parse(localStorage.getItem('books'));
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));

        this.shelfNum = this.numShelves() - 1; // Go to shelf where book is added
    };

    this.removeBook = index => {
        const books = JSON.parse(localStorage.getItem('books'));
        books.splice(index, 1);
        localStorage.setItem('books', JSON.stringify(books));

        this.shelfNum = this.numShelves() - 1;
    }

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
    };

    this.updateStats = () => {
        const allBooks = JSON.parse(localStorage.getItem('books'));
        
        const booksRead = allBooks.filter(book => {
            return book.status === 'read';
        });

        const booksReading = allBooks.filter(book => {
            return book.status === 'reading';
        });

        const booksToRead = allBooks.filter(book => {
            return book.status === 'to-read';
        });

        const numTotal = allBooks.length;
        const numRead = booksRead.length;
        const numReading = booksReading.length;
        const numToRead = booksToRead.length;

        document.querySelector('table.library-stats tr.total-books td').textContent = numTotal;
        document.querySelector('table.library-stats tr.books-read td').textContent = numRead;
        document.querySelector('table.library-stats tr.books-reading td').textContent = numReading;
        document.querySelector('table.library-stats tr.books-to-read td').textContent = numToRead;
    };
}


document.addEventListener('DOMContentLoaded', () => {
    library.renderTable();
    library.updateStats();
})

// Add book
addBookForm.addEventListener('submit', event => {
    event.preventDefault(); // Prevent page refresh

    const title = titleField.value;
    const author = authorField.value;
    const rating = ratingField.value;
    const dateRead = dateReadField.value;
    const status = document.querySelector('input[name="status"]:checked').value;

    const book = Book(title, author, rating, dateRead, status);
    library.addBook(book);
    library.renderTable();
    library.updateStats();

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

    const titleField = document.getElementById('edit-title');
    const authorField = document.getElementById('edit-author');
    const ratingField = document.getElementById('edit-rating');
    const currentRatingOption = editForm.querySelector(`option[value="${targetBook.rating}"]`);
    const dateField = document.getElementById('edit-date-read');
    const currentStatus = editForm.querySelector(`input[name="status"][value="${targetBook.status}"]`)

    // Pre-fill each form field with current data of book
    titleField.value = targetBook.title;
    authorField.value = targetBook.author;
    currentRatingOption.setAttribute('selected', 'selected');
    dateField.value = targetBook.dateRead;
    currentStatus.setAttribute('checked', 'checked');

    const saveBtn = editForm.querySelector('button.save');
    const removeBtn = editForm.querySelector('button.remove');
    const cancelBtn = editForm.querySelector('button.cancel');

    // Save changes
    saveBtn.addEventListener('click', () => {
        targetBook.title = titleField.value;
        targetBook.author = authorField.value;
        targetBook.rating = ratingField.value;
        targetBook.dateRead = dateField.value;
        targetBook.status = editForm.querySelector(`input[name="status"]:checked`).value;

        books[index] = targetBook;

        localStorage.setItem('books', JSON.stringify(books));
        library.renderTable();
        library.updateStats();
        editModal.classList.remove('show');
    })

    // Remove book
    removeBtn.addEventListener('click', () => {
        library.removeBook(index);
        library.renderTable();
        library.updateStats();
        editModal.classList.remove('show');
    })

    // Cancel edit
    cancelBtn.addEventListener('click', () => {
        editModal.classList.remove('show');
    })
})


// Navigation between table pages/shelves
const prevBtns = document.querySelectorAll('div.table-nav button.prev');
const nextBtns = document.querySelectorAll('div.table-nav button.next');

nextBtns.forEach(nextBtn => {
    nextBtn.addEventListener('click', () => {
        if (library.shelfNum === library.numShelves() - 1) { // Cannot go to next shelf if already at last shelf
            return;
        }
    
        const books = JSON.parse(localStorage.getItem('books'));
        library.shelfNum += 1;
        library.renderTable();
    })    
}) 

prevBtns.forEach(prevBtn => {
    prevBtn.addEventListener('click', () => {
        if (library.shelfNum === 0) { // Cannot go to previous shelf if already at first shelf
            return;
        }
    
        const books = JSON.parse(localStorage.getItem('books'));
        library.shelfNum -= 1;
        library.renderTable();
    })    
})
