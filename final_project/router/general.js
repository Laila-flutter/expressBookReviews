const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js"); // Import the books database
let users = {}; // This object will store registered users
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = { username, password }; // In a real application, hash the password before storing
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop using async-await with Axios
public_users.get('/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    const bookList = response.data;
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN using async-await with Axios
public_users.get('/async-isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/${isbn}`);
    const bookDetails = response.data;
    res.status(200).json(bookDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get book details based on Title using async-await with Axios
public_users.get('/async-title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/');
    const bookList = response.data;
    const result = Object.values(bookList).filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get book details based on Title using Promises with callbacks
public_users.get('/promise-title/:title', (req, res) => {
  const title = req.params.title;
  axios.get('http://localhost:5000/')
    .then(response => {
      const bookList = response.data;
      const result = Object.values(bookList).filter(book => book.title.toLowerCase() === title.toLowerCase());

      if (result.length > 0) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book details", error: error.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = [];

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      result.push(books[isbn]);
    }
  }

  if (result.length > 0) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = [];

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      result.push(books[isbn]);
    }
  }

  if (result.length > 0) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (book.reviews && Object.keys(book.reviews).length > 0) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "No reviews found for this book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
