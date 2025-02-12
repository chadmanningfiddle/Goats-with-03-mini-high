const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine and define the views folder.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder and src folder for React components
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));

// Parse URL-encoded bodies (for form submissions).
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up session middleware.
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret in production.
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Routes

// Home page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

// Process login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Dummy authentication – replace with real logic
  if (username === 'admin' && password === 'password') {
    req.session.user = { username, isAdmin: true };
    res.redirect('/');
  } else if (username && password) { // Simple user login
    req.session.user = { username, isAdmin: false };
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Send script to clear localStorage and redirect
    res.send(`
      <script>
        localStorage.clear();
        window.location.href = '/';
      </script>
    `);
  });
});

// Signup page
app.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('signup', { error: null });
});

// Process signup
app.post('/signup', (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match' });
  }
  // Normally store the new user in your database
  req.session.user = { username, isAdmin: false };
  res.redirect('/');
});

// Private Lessons page
app.get('/private-lessons', requireAuth, (req, res) => {
  res.render('private-lessons', { user: req.session.user });
});

// Monday Sessions: Relaxed Pace
app.get('/monday-sessions-relaxed-pace', requireAuth, (req, res) => {
  res.render('monday-sessions-relaxed-pace', { user: req.session.user });
});

// Monday Sessions: Moving Along
app.get('/monday-sessions-moving-along', requireAuth, (req, res) => {
  res.render('monday-sessions-moving-along', { user: req.session.user });
});

// Monday Calendar page
app.get('/monday-calendar', requireAuth, (req, res) => {
  res.render('monday-calendar', { user: req.session.user });
});

// Admin dashboard
app.get('/admin', requireAuth, (req, res) => {
  if (!req.session.user?.isAdmin) {
    return res.redirect('/');
  }
  res.render('admin');
});

// Fiddler's Log page
app.get('/fiddlers-log', requireAuth, (req, res) => {
  res.render('fiddlers-log', { user: req.session.user });
});

// API endpoints for React components
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

app.get('/api/lessons', requireAuth, (req, res) => {
  // This would normally fetch from a database
  res.json({
    privateLessons: JSON.parse(localStorage.getItem('privateLessons') || '[]'),
    mondayLessons: JSON.parse(localStorage.getItem('mondayCart') || '[]')
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: { status: 404 }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});