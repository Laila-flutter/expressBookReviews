const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;
const secretKey = 'your_jwt_secret'; // Replace with a strong secret key

let users = {}; // This should be replaced with a database in a real application
let books = {
  "978-3-16-148410-0": { title: "Sample Book", author: "Author Name", reviews: {} }
};

app.use(bodyParser.json());

// Register Route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = { username, password }; // Hash password in a real application
  return res.status(201).json({ message: "User registered successfully" });
});

// Login Route
app.post('/customer/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  res.status(200).json({ message: "Login successful", token });
});

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Add or modify a book review
app.post('/review/:isbn', authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  res.status(200).json({ message: "Review added or updated successfully" });
});

// Delete a book review
app.delete('/auth/review/:isbn', authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  // Optionally remove the reviews object if it's empty
  if (Object.keys(books[isbn].reviews).length === 0) {
    delete books[isbn].reviews;
  }

  res.status(200).json({ message: "Review deleted successfully" });
});

// Test Route
app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json(books);
});

// Include public routes
const publicRoutes = require('./general').general;
app.use('/public', publicRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
