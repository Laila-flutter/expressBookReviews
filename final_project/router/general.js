const express = require('express');
let books = require("./booksdb.js");
let users = {};
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register the new user
  users[username] = { username, password };  // In a real application, hash the password before storing
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
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
public_users.get('/title/:title', function (req, res) {
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
public_users.get('/review/:isbn', function (req, res) {
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
