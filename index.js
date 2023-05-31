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
function Book(title, author, ratingString, dateRead, status) {
    let rating = null;
    if (ratingString !== '-') {
        rating = Number(ratingString);
    }
    return { title, author, rating, dateRead, status };
}

// Initialize empty bookshelves in local storage 
if (localStorage.getItem('books') === null) {
    const read = [];
    const reading = [];
    const toRead = [];

    const books = {
        "read": read,
        "reading": reading,
        "to-read": toRead // Remember that json must have double quotes and not single quotes!
    }

    localStorage.setItem('books', JSON.stringify(books));
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
    
    // Get array of book objects from this shelf e.g. all books read, or all books to read
    const getBooks = () => {
        const allBooks = JSON.parse(localStorage.getItem('books'));
        const books = allBooks[status];
        sortedBooks = sortShelf(books)
        return sortedBooks;
    };
    
    // Update array of book objects for this shelf
    const setBooks = books => {
        const allBooks = JSON.parse(localStorage.getItem('books'));
        allBooks[status] = books;
        localStorage.setItem('books', JSON.stringify(allBooks));
    }
    
    
    // const bookCapacity = pageSize * numPages;
    
    const addBook = book => {
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
            books.sort((bookA , bookB) => {
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
        let books = getBooks();

        const placeholder = status === 'read'
                          ? "<tr><td colspan='6'>You haven't marked any books as read</td></tr>"
                          : status === 'reading'
                          ? "<tr><td colspan='6'>You aren't currently reading any books</td></tr>"
                          : "<tr><td colspan='6'>You don't currently plan to read any books</td></tr>"

        if (books.length === 0) { // Empty table placeholder
            table.innerHTML = placeholder;
            return;
        }

        // filterShelf();

        table.innerHTML = '';

        const currentBooks = books.slice(pageNum * pageSize,
            pageNum * pageSize + pageSize);

        currentBooks.forEach((book, index) => {
            const bookEntry = document.querySelector('template.book-entry').content.cloneNode(true);

            bookEntry.querySelector('td.index').textContent = index + pageNum * pageSize + 1;
            bookEntry.querySelector('td.title').textContent = book.title;
            bookEntry.querySelector('td.author').textContent = book.author;

            if (!book.rating) {
                bookEntry.querySelector('td.rating span.rating').textContent = "-";
            } else {
                bookEntry.querySelector('td.rating span.rating').textContent = book.rating;
            }

            bookEntry.querySelector('td.date-read').textContent = book.dateRead;

            table.appendChild(bookEntry);
        });
    };

    return {
        status,
        table,
        pageSize, numPages,
        getBooks, setBooks,
        addBook, removeBook,
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
        const books = JSON.parse(localStorage.getItem('books'));
        const allBooks = books['read'].concat(books['reading'], books['to-read']);

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
        const books = JSON.parse(localStorage.getItem('books'));

        const numRead = books['read'].length;
        const numReading = books['reading'].length;
        const numToRead = books['to-read'].length;
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
    const dateReadField = document.getElementById('date-read');

    const title = titleField.value;
    const author = authorField.value;
    const rating = ratingField.value;
    const dateRead = dateReadField.value;
    const status = document.querySelector('input[name="status"]:checked').value;

    const book = Book(title, author, rating, dateRead, status);
    library.addBook(book);
    library.renderTable(status);
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

        const books = shelf.getBooks();

        const tableRow = event.target.parentElement.parentElement;
        const index = Number(tableRow.querySelector('td.index').textContent) - 1;
        const targetBook = books[index];

        editModal.classList.add('show');

        const titleField = document.getElementById('edit-title');
        const authorField = document.getElementById('edit-author');
        const ratingField = document.getElementById('edit-rating');
        const dateField = document.getElementById('edit-date-read');
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
    
            dateField.value = targetBook.dateRead;
            currentStatus.checked = true;
    
            // Bind the index of the target book to the edit-form and the remove button 
            // This allows the respective event listener callback functions to identify the target book
            editForm['data-shelf'] = shelf.status
            editForm['data-index'] = index;
    
            removeBtn['data-shelf'] = shelf.status
            removeBtn['data-index'] = index;
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
    const dateField = document.getElementById('edit-date-read');

    targetBook.title = titleField.value;
    targetBook.author = authorField.value;

    if (ratingField.value === '-') {
        targetBook.rating = null;
    } else {
        targetBook.rating = Number(ratingField.value);
    }

    targetBook.dateRead = dateField.value;

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
        shelf.setBooks(books);
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



