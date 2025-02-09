// app.js
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// ===== MIDDLEWARE =====
// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up EJS templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up session management
app.use(session({
  secret: 'your-secret-key', // change this for production!
  resave: false,
  saveUninitialized: false
}));

// ===== DATABASE SETUP =====
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS lessons(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      time TEXT,
      description TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS bookings(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      lessonId INTEGER,
      note TEXT,
      payment INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(lessonId) REFERENCES lessons(id)
    )`);
  }
});

// Pre-populate lessons if none exist
db.get("SELECT COUNT(*) as count FROM lessons", (err, row) => {
  if (err) {
    console.error("Error querying lessons count:", err.message);
  } else if (row && row.count === 0) {
    const insertSql = `INSERT INTO lessons (date, time, description) VALUES (?,?,?)`;
    db.run(insertSql, ['2025-02-17', '09:00', 'Oldtime Morning Groove']);
    db.run(insertSql, ['2025-02-17', '10:00', 'Twin Fiddles']);
    db.run(insertSql, ['2025-02-17', '11:00', 'Swing Time']);
    db.run(insertSql, ['2025-02-17', '12:00', 'Bluegrass Instrumentals']);
    db.run(insertSql, ['2025-02-17', '13:00', 'Bluegrass Jam']);
  }
});

// ===== ROUTES =====

// Home Page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Login Routes
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error(err.message);
      res.render('login', { error: 'Error occurred.' });
    } else if (row) {
      req.session.user = row;
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid username or password.' });
    }
  });
});

// Signup Routes
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(sql, [username, password], function(err) {
    if (err) {
      console.error(err.message);
      res.render('signup', { error: 'Error: Username may already exist.' });
    } else {
      req.session.user = { id: this.lastID, username };
      res.redirect('/');
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Private Lessons Page (requires login)
app.get('/private-lessons', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  db.all("SELECT * FROM lessons ORDER BY date, time", [], (err, lessons) => {
    if (err) {
      console.error(err.message);
      lessons = [];
    }
    res.render('private-lessons', { user: req.session.user, lessons });
  });
});

// Book a Lesson
app.post('/book-lesson', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { lessonId, note, payment } = req.body;
  const sql = 'INSERT INTO bookings (userId, lessonId, note, payment) VALUES (?, ?, ?, ?)';
  db.run(sql, [req.session.user.id, lessonId, note, payment === 'on' ? 1 : 0], function(err) {
    if (err) {
      console.error(err.message);
      res.send("Error booking lesson.");
    } else {
      res.redirect('/fiddlers-log');
    }
  });
});

// Fiddler's Log (booking history)
app.get('/fiddlers-log', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const sql = `
    SELECT b.id as bookingId, l.*, b.note, b.payment
    FROM bookings b
    JOIN lessons l ON b.lessonId = l.id
    WHERE b.userId = ?
    ORDER BY l.date, l.time
  `;
  db.all(sql, [req.session.user.id], (err, bookings) => {
    if (err) {
      console.error(err.message);
      bookings = [];
    }
    res.render('fiddlers-log', { user: req.session.user, bookings });
  });
});

// ===== START THE SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});