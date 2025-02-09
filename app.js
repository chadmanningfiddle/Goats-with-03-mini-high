// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine and define the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
  secret: 'your secret key', // replace with your own secret
  resave: false,
  saveUninitialized: false
}));

// Routes

// Home page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Replace this with your real authentication logic.
  if (username === 'admin' && password === 'password') {
    req.session.user = { username };
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Signup routes (you will need to add real user registration logic)
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signup', (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match' });
  }
  // Here you would normally save the new user to your database.
  // For demo purposes, we just log them in.
  req.session.user = { username };
  res.redirect('/');
});

// Private Lessons (protected route)
app.get('/private-lessons', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('private-lessons', { user: req.session.user });
});

// (Optional) Fiddler's Log page route – add a corresponding view file if needed.
app.get('/fiddlers-log', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // For now, render a simple placeholder
  res.send("<h1>Fiddler's Log</h1><p>This page is under construction.</p>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});