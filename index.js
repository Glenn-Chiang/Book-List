const addBookBtn = document.querySelector('button.add-book');
const addBookForm = document.querySelector('form.add-book');
const submitAddBook = document.querySelector("form.add-book button.submit")
const cancelAddBook = document.querySelector("form.add-book button.cancel")


addBookBtn.addEventListener('click', () => {
    addBookForm.classList.add('show');
    addBookBtn.classList.add('hide');
    document.getElementById('title').focus();
})

cancelAddBook.addEventListener('click', () => {
    addBookForm.classList.remove('show');
    addBookBtn.classList.remove('hide');
    // Clear fields
    addBookForm.reset();
})


// Book object factory function
function Book(title, author, ratingString, status) {
    let rating = null;
    if (ratingString !== '-') {
        rating = Number(ratingString);
    }
    return { title, author, rating, status };
}

// Initialize empty bookshelves in local storage 
if (localStorage.getItem('library') === null) {
    const read = [];
    const reading = [];
    const toRead = [];

    const library = {
        "read": read,
        "reading": reading,
        "to-read": toRead // Remember that json must have double quotes and not single quotes!
    }

    localStorage.setItem('library', JSON.stringify(library));
}

// Constructor function for read, reading and toRead shelves
function Bookshelf(shelfStatus) {
    const status = shelfStatus;

    const table = document.querySelector(`section.${status} table tbody`);

    const pageSize = 10; // Number of books displayed per table page

    const numPages = () => {
        const books = getBooks();

        return books.length % pageSize === 0
            ? books.length / pageSize
            : books.length < pageSize
                ? 1
                : Math.floor(books.length / pageSize) + 1;
    };

    // Display first page of table when site is first loaded
    // Private variable; closure allows the returned object to retain access to this variable
    let pageNum = 0;

    const prevBtns = document.querySelectorAll(`section.${status} button.prev`);
    const nextBtns = document.querySelectorAll(`section.${status} button.next`);
    const firstBtns = document.querySelectorAll(`section.${status} button.first`);
    const lastBtns = document.querySelectorAll(`section.${status} button.last`);

    // Navigation between table pages/shelves
    prevBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (pageNum === 0) { // Cannot go to previous shelf if already at first shelf
                return;
            }

            pageNum -= 1;
            renderTable();
        })
    });

    nextBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (pageNum === numPages() - 1) { // Cannot go to next shelf if already at last shelf
                return;
            }

            pageNum += 1;
            renderTable();
        })
    });

    firstBtns.forEach(button => {
        button.addEventListener('click', () => {
            pageNum = 0;
            renderTable();
        })
    });

    lastBtns.forEach(button => {
        button.addEventListener('click', () => {
            pageNum = numPages() - 1;
            renderTable();
        })
    })

    // Get array of book objects from this shelf 
    // Store the book's original index (its index in the STORED array) as a property of the book
    // This allows us to locate the book in the stored array even after the array is filtered and sorted
    const getBooks = () => {
        const library = JSON.parse(localStorage.getItem('library'));
        const books = library[status] // Array of all books in this shelf

        books.forEach((book, index) => {
            book.index = index;
        })

        return books;
    };

    // Update array of book objects for this shelf
    const setBooks = books => {
        const library = JSON.parse(localStorage.getItem('library'));
        library[status] = books;
        localStorage.setItem('library', JSON.stringify(library));
    }

    // Whenever a book is added to any shelf, update its 'dateAdded' property
    const addBook = book => {
        const currentDate = (new Date()).toISOString().split('T')[0];
        book.dateAdded = currentDate;

        const books = getBooks();
        books.push(book);
        setBooks(books);
    };

    const removeBook = index => {
        const books = getBooks();
        books.splice(index, 1);
        setBooks(books);
        // If there is only 1 remaining book on the last page and we remove it,
        // go to the previous page, which will now become the last page
        if (pageNum === numPages()) {
            pageNum = numPages() - 1;
        }
    };

    // Filtering/searching
    let filterTerm = null;

    const filterField = document.querySelector(`section.${status} input.filter`);
    const filterBtn = document.querySelector(`section.${status} button.filter`);

    filterBtn.addEventListener('click', () => {
        filterTerm = filterField.value.toLowerCase();
        renderTable();
    })

    const filterShelf = books => {
        if (!filterTerm) {
            return books;
        }

        return books.filter(book => {
            return book.title.toLowerCase().includes(filterTerm) ||
                book.author.toLowerCase().includes(filterTerm);
        })
    }

    // Sorting
    let sortBasis = 'author';

    const sortOptions = document.querySelector(`section.${status} select.sort`);
    const sortBtn = document.querySelector(`section.${status} button.sort`);

    sortBtn.addEventListener('click', () => {
        sortBasis = sortOptions.value;
        renderTable();
    })

    const sortShelf = books => {
        const sortByAuthor = books => {
            books.sort((bookA, bookB) => {
                if (bookA.author.toLowerCase() < bookB.author.toLowerCase()) {
                    return -1;
                } else {
                    return 1;
                }
            });
            return books;
        }

        const sortByRatingAsc = books => {
            books.sort((bookA, bookB) => {
                return bookA.rating - bookB.rating;
            });
            return books;
        };

        const sortByRatingDesc = books => {
            books.sort((bookA, bookB) => {
                return bookB.rating - bookA.rating;
            });
            return books;
        };

        if (sortBasis === 'date-added') {
            return books; // Original order in which books are stored in local storage
        } else if (sortBasis === 'author') {
            return sortByAuthor(books);
        } else if (sortBasis === 'rating-asc') {
            return sortByRatingAsc(books);
        } else if (sortBasis === 'rating-desc') {
            return sortByRatingDesc(books);
        }
    };


    const renderTable = () => {
        const allBooks = getBooks(); // All books on this shelf
        const currentBooks = sortShelf(filterShelf(allBooks)); // Filtered and sorted books

        const placeholder = filterTerm !== null
            ? "<td colspan='6'>No books found</td>"
            : status === 'read'
            ? "<td colspan='6'>You haven't marked any books as read</td>"
            : status === 'reading'
                ? "<td colspan='6'>You aren't currently reading any books</td>"
                : "<td colspan='6'>You don't currently plan to read any books</td>"

        if (currentBooks.length === 0) { // Empty table placeholder
            table.querySelector('tr').innerHTML = placeholder;
            return;
        }

        table.innerHTML = '';

        const renderedBooks = currentBooks.slice(pageNum * pageSize, // Books shown on current page in table
            pageNum * pageSize + pageSize);

        renderedBooks.forEach((book, index) => {
            const bookEntry = document.querySelector('template.book-entry').content.cloneNode(true);

            bookEntry.querySelector('td.index').textContent = index + pageNum * pageSize + 1;
            bookEntry.querySelector('td.title').textContent = book.title;
            bookEntry.querySelector('td.author').textContent = book.author;

            bookEntry.querySelector('td.rating span.rating').textContent = book.rating === null
                ? '-'
                : book.rating;

            bookEntry.querySelector('td.date-added').textContent = book.dateAdded;

            table.appendChild(bookEntry);
        });
    };

    return {
        status,
        table,
        getBooks, setBooks,
        addBook, removeBook,
        sortShelf, filterShelf,
        renderTable
    };

}

// Library object created via IIFE
const library = (() => {
    const readShelf = Bookshelf('read');
    const readingShelf = Bookshelf('reading');
    const toReadShelf = Bookshelf('to-read');

    const getShelves = () => {
        return [readShelf, readingShelf, toReadShelf];
    }

    const addBook = book => {
        if (book.status === 'read') {
            // console.log(readShelf)
            readShelf.addBook(book);
        } else if (book.status === 'reading') {
            readingShelf.addBook(book);
        } else if (book.status === 'to-read') {
            toReadShelf.addBook(book);
        }
    };

    // Update all shelf tables
    const renderTables = () => {
        readShelf.renderTable();
        readingShelf.renderTable();
        toReadShelf.renderTable();
    };

    // Update specific shelf table
    const renderTable = status => {
        if (status === 'read') {
            readShelf.renderTable();
        } else if (status === 'reading') {
            readingShelf.renderTable();
        } else if (status === 'to-read') {
            toReadShelf.renderTable();
        }
    }

    // Private method
    const calcAverageRating = () => {
        const library = JSON.parse(localStorage.getItem('library'));
        const allBooks = library['read'].concat(library['reading'], library['to-read']);

        let numRatedBooks = 0;

        // Sum up all ratings
        const ratingSum = allBooks.reduce((sum, book) => {
            if (book.rating) {
                numRatedBooks += 1;
                return sum += Number(book.rating);
            } else {
                return sum;
            }
        }, 0);

        if (numRatedBooks === 0) { // No books rated
            return 0;
        }

        return (Math.round((ratingSum / numRatedBooks) * 10) / 10).toFixed(1); // 1 decimal place
    };

    const updateStats = () => {
        const library = JSON.parse(localStorage.getItem('library'));

        const numRead = library['read'].length;
        const numReading = library['reading'].length;
        const numToRead = library['to-read'].length;
        const numTotal = numRead + numReading + numToRead;

        document.querySelector('table.library-stats tr.total-books td').textContent = numTotal;
        document.querySelector('table.library-stats tr.books-read td').textContent = numRead;
        document.querySelector('table.library-stats tr.books-reading td').textContent = numReading;
        document.querySelector('table.library-stats tr.books-to-read td').textContent = numToRead;

        const averageRating = calcAverageRating();

        document.querySelector('table.library-stats tr.average-rating td').textContent = averageRating !== 0 ? averageRating : "You haven't rated any books";
    };

    return {
        'read': readShelf,
        'reading': readingShelf,
        'to-read': toReadShelf,
        getShelves, addBook, renderTable, renderTables, updateStats
    };
})();


document.addEventListener('DOMContentLoaded', () => {
    library.renderTables();
    library.updateStats();
})

// Add book
addBookForm.addEventListener('submit', event => {
    event.preventDefault(); // Prevent page refresh

    // Add-book form fields
    const titleField = document.getElementById('title');
    const authorField = document.getElementById('author');
    const ratingField = document.getElementById('rating');

    const title = titleField.value.trim();
    const author = authorField.value.trim();
    const rating = ratingField.value;
    const status = document.querySelector('input[name="status"]:checked').value;

    const book = Book(title, author, rating, status);
    library[status].addBook(book);
    library[status].renderTable();
    library.updateStats();

    addBookForm.classList.remove('show');
    addBookBtn.classList.remove('hide');
    // Clear fields
    addBookForm.reset();
})

// Edit-book form
const editModal = document.querySelector('div.edit-book');
const editForm = document.querySelector('form.edit-book');

const saveBtn = editForm.querySelector('button.save');
const removeBtn = editForm.querySelector('button.remove');
const cancelBtn = editForm.querySelector('button.cancel');

const shelves = library.getShelves();

shelves.forEach(shelf => {
    // Editing books
    shelf.table.addEventListener('click', event => {
        // Use event delegation to bind event listener to table instead of binding directly to edit buttons 
        if (event.target.tagName !== 'BUTTON' || !event.target.classList.contains('edit')) {
            return;
        }
        // The following code will only run if clicked element is an edit-book button

        const books = shelf.sortShelf(shelf.filterShelf(shelf.getBooks()));

        const tableRow = event.target.parentElement.parentElement;
        const renderedIndex = Number(tableRow.querySelector('td.index').textContent) - 1;
        const targetBook = books[renderedIndex];

        editModal.classList.add('show');

        const titleField = document.getElementById('edit-title');
        const authorField = document.getElementById('edit-author');
        const ratingField = document.getElementById('edit-rating');
        const currentStatus = editForm.querySelector(`input[name="status"][value="${targetBook.status}"]`)

        // Pre-fill each form field with current data of book
        function preFill() {
            titleField.value = targetBook.title;
            authorField.value = targetBook.author;

            if (targetBook.rating) {
                ratingField.value = targetBook.rating;
            } else {
                ratingField.value = "-";
            }

            currentStatus.checked = true;

            // Bind the index of the target book to the edit-form and the remove button 
            // This allows the respective event listener callback functions to identify the target book
            editForm['data-shelf'] = shelf.status
            editForm['data-index'] = targetBook.index;

            removeBtn['data-shelf'] = shelf.status
            removeBtn['data-index'] = targetBook.index;
        }

        preFill();
    })
})

// Save edit
editForm.addEventListener('submit', event => {
    event.preventDefault(); // Prevent page refresh

    const shelf = library[event.target['data-shelf']];
    const index = event.target['data-index']; // Identify which book to edit

    const books = shelf.getBooks();
    const targetBook = books[index];

    const titleField = document.getElementById('edit-title');
    const authorField = document.getElementById('edit-author');
    const ratingField = document.getElementById('edit-rating');

    targetBook.title = titleField.value.trim();
    targetBook.author = authorField.value.trim();

    if (ratingField.value === '-') {
        targetBook.rating = null;
    } else {
        targetBook.rating = Number(ratingField.value);
    }

    const newStatus = editForm.querySelector(`input[name="status"]:checked`).value;
    if (targetBook.status !== newStatus) { // If status is changed, move book to new shelf
        // Add book to new shelf
        targetBook.status = newStatus;
        library[newStatus].addBook(targetBook);
        library[newStatus].renderTable();
        // Remove book from current shelf
        shelf.removeBook(index);
        shelf.renderTable();

    } else {
        books[index] = targetBook; // if status is unchanged, book remains in current shelf
        shelf.setBooks(allBooks);
        shelf.renderTable();
    }

    library.updateStats();
    editModal.classList.remove('show');
})

// Remove book
removeBtn.addEventListener('click', event => {
    const shelf = library[event.target['data-shelf']];
    const index = event.target['data-index']; // Identify which book to edit

    shelf.removeBook(index);
    shelf.renderTable();
    library.updateStats();
    editModal.classList.remove('show');
})

// Cancel edit
cancelBtn.addEventListener('click', () => {
    editModal.classList.remove('show');
})



