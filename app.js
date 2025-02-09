// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
  secret: 'your secret key here', // Change this to your own secret string
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
  // Dummy authentication – replace with real logic as needed
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

// Signup routes
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signup', (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match' });
  }
  // Here you’d normally save the user in a database.
  req.session.user = { username };
  res.redirect('/');
});

// Private Lessons page
app.get('/private-lessons', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('private-lessons', { user: req.session.user });
});

// Monday Sessions: Chill
app.get('/monday-sessions-chill', (req, res) => {
  res.render('monday-sessions-chill', { user: req.session.user });
});

// Monday Sessions: Cruising
app.get('/monday-sessions-cruising', (req, res) => {
  res.render('monday-sessions-cruising', { user: req.session.user });
});

// Fiddler's Log page (create a view for this if desired)
app.get('/fiddlers-log', (req, res) => {
  // For now, just send a simple response:
  res.send("<h1>Fiddler's Log</h1><p>This page is under construction.</p>");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});