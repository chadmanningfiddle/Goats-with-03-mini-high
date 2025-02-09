// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine and define the views folder.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Set up session middleware.
app.use(session({
  secret: 'your-secret-key', // Replace with your own secret in production.
  resave: false,
  saveUninitialized: false
}));

// ROUTES

// Home page.
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Login page.
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Process login.
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Dummy authentication: replace with your own logic.
  if (username === 'admin' && password === 'password') {
    req.session.user = { username };
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Logout.
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Signup page.
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Process signup.
app.post('/signup', (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match' });
  }
  // Here you would normally save the new user to your database.
  req.session.user = { username };
  res.redirect('/');
});

// Private Lessons page.
app.get('/private-lessons', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('private-lessons', { user: req.session.user });
});

// Monday Sessions: Chill page.
app.get('/monday-sessions-chill', (req, res) => {
  res.render('monday-sessions-chill', { user: req.session.user });
});

// Monday Sessions: Cruising page.
app.get('/monday-sessions-cruising', (req, res) => {
  res.render('monday-sessions-cruising', { user: req.session.user });
});

// Fiddler's Log page.
app.get('/fiddlers-log', (req, res) => {
  res.render('fiddlers-log', { user: req.session.user });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});