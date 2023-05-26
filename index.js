const addBookBtn = document.querySelector('button.add-book');
const addBookForm = document.querySelector('form.add-book');
const submitAddBook = document.querySelector("form.add-book button.submit")
const cancelAddBook = document.querySelector("form.add-book button.cancel")

addBookBtn.addEventListener('click', () => {
    addBookForm.classList.add('show');
    addBookBtn.classList.add('hide');
})

cancelAddBook.addEventListener('click', () => {
    addBookForm.classList.remove('show');
    addBookBtn.classList.remove('hide');
})


// Book object factory function
function Book(title, author, rating, dateRead) {
    const fullTitle = `'${title}' by ${author}`;
    return { title, author, rating, dateRead, fullTitle };
}

// Library object
const library = {
    books: [],
    addBook: function (book) {
        book.index = this.books.length + 1;
        this.books.push(book);
    },
    listBooks: function () {
        this.books.forEach((book) => {
            console.log(book);
        })
    }
};


submitAddBook.addEventListener('click', () => {
    const titleField = document.getElementById('title');
    const authorField = document.getElementById('author');
    const ratingField = document.getElementById('rating');
    const dateReadField = document.getElementById('date-read');
    
    const title = titleField.value;
    const author = authorField.value;
    const rating = ratingField.value;
    const dateRead = dateReadField.value;

    const book = Book(title, author, rating, dateRead);
    library.addBook(book);

    alert(`Added ${book.fullTitle} to Library!`);
})



