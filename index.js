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

// Library object

const books = [];
const libraryTable = document.querySelector('table.library tbody');

function addBook(book) {
    books.push(book);
}

function renderTable() {
    libraryTable.innerHTML = '';
    books.forEach(book => {
        const bookEntry = `<tr>
                          <td>${book.title}</td>
                             <td>${book.author}</td>
                             <td>${book.rating}</td>
                             <td>${book.dateRead}</td>
                             </tr>`;
        libraryTable.innerHTML += bookEntry;
    }); 
}


// const library = {
//     books: [],
//     libraryTable: document.querySelector('table.library tbody'),

//     addBook: function (book) {
//         this.books.push(book);
//     },
    
//     renderTable: function () {
//         this.books.forEach(book => {
//             const bookEntry = `<tr>
//                             <td>${book.title}</td>
//                             <td>${book.author}</td>
//                             <td>${book.rating}</td>
//                             <td>${book.dateRead}</td>
//                             </tr>`;
//             this.libraryTable.innerHTML += bookEntry;
//         })
//     }
// };

// library.renderTable();


submitAddBook.addEventListener('click', () => {
    const title = titleField.value;
    const author = authorField.value;
    const rating = ratingField.value;
    const dateRead = dateReadField.value;

    const book = Book(title, author, rating, dateRead);
    addBook(book);
    renderTable();
})
