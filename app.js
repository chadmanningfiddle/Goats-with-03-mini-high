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
  secret: 'your-secret-key', // Change this in production!
  resave: false,
  saveUninitialized: false
}));

// ===== DATABASE SETUP =====
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create the users table
    db.run(`CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
    // Create the lessons table (for group lessons)
    db.run(`CREATE TABLE IF NOT EXISTS lessons(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      time TEXT,
      description TEXT
    )`);
    // Create the bookings table (for group lessons)
    db.run(`CREATE TABLE IF NOT EXISTS bookings(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      lessonId INTEGER,
      note TEXT,
      payment INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(lessonId) REFERENCES lessons(id)
    )`);
    // Create the private_bookings table (for private lessons)
    db.run(`CREATE TABLE IF NOT EXISTS private_bookings(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      startTime TEXT,
      duration INTEGER,
      note TEXT,
      payment INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);
  }
});

// Pre-populate the group lessons table if no lessons exist
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

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ----- Private Lesson Schedule & Booking Routes ----- //

// GET /private-lesson-schedule: Display the available private lesson slots for the current week
app.get('/private-lesson-schedule', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  // Calculate dates for the current week (assuming week starts on Monday)
  const now = new Date();
  const day = now.getDay(); // 0=Sunday, 1=Monday, etc.
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);

  // Get the dates for Tuesday, Wednesday, Thursday, and Friday
  const tuesday = new Date(monday); tuesday.setDate(monday.getDate() + 1);
  const wednesday = new Date(monday); wednesday.setDate(monday.getDate() + 2);
  const thursday = new Date(monday); thursday.setDate(monday.getDate() + 3);
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4);

  // Helper function to format a Date as YYYY-MM-DD
  function formatDate(d) {
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  // Define available private lesson slots per day:

  // Tuesday & Thursday: lessons start on the hour from 8:00 to 14:00 (7 slots, each 55 minutes)
  const tueThuSlots = [
    { start: "08:00", duration: 55 },
    { start: "09:00", duration: 55 },
    { start: "10:00", duration: 55 },
    { start: "11:00", duration: 55 },
    { start: "12:00", duration: 55 },
    { start: "13:00", duration: 55 },
    { start: "14:00", duration: 55 }
  ];

  // Wednesday: lessons start on the half hour from 7:30 to 13:30 (7 slots)
  const wedSlots = [
    { start: "07:30", duration: 55 },
    { start: "08:30", duration: 55 },
    { start: "09:30", duration: 55 },
    { start: "10:30", duration: 55 },
    { start: "11:30", duration: 55 },
    { start: "12:30", duration: 55 },
    { start: "13:30", duration: 55 }
  ];

  // Friday: a mixed schedule:
  // Morning: available at 08:30 and 09:30, plus a 10:30 slot lasting 30 minutes.
  // Afternoon: available at 12:00, 13:00, and 14:00 (each 55 minutes).
  const friSlots = [
    { start: "08:30", duration: 55 },
    { start: "09:30", duration: 55 },
    { start: "10:30", duration: 30 },
    { start: "12:00", duration: 55 },
    { start: "13:00", duration: 55 },
    { start: "14:00", duration: 55 }
  ];

  // Build the schedule object keyed by date (in YYYY-MM-DD format)
  let schedule = {};
  schedule[formatDate(tuesday)] = tueThuSlots;
  schedule[formatDate(thursday)] = tueThuSlots;
  schedule[formatDate(wednesday)] = wedSlots;
  schedule[formatDate(friday)] = friSlots;

  // Get the dates we're scheduling for
  const dates = Object.keys(schedule);

  // Query existing private lesson bookings for these dates
  const placeholders = dates.map(() => '?').join(',');
  const sql = `SELECT * FROM private_bookings WHERE date IN (${placeholders})`;
  db.all(sql, dates, (err, bookings) => {
    if (err) {
      console.error(err.message);
      bookings = [];
    }
    // Mark slots as booked if a matching booking exists
    bookings.forEach(b => {
      if (schedule[b.date]) {
        const slot = schedule[b.date].find(s => s.start === b.startTime);
        if (slot) {
          slot.booked = true;
          slot.bookingInfo = b;
        }
      }
    });
    // Render the schedule page
    res.render('private-lesson-schedule', { user: req.session.user, schedule, dates });
  });
});

// POST /book-private-lesson: Handle booking a private lesson slot
app.post('/book-private-lesson', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { date, startTime, duration, note, payment } = req.body;
  const sql = `INSERT INTO private_bookings (userId, date, startTime, duration, note, payment)
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [req.session.user.id, date, startTime, duration, note, payment === 'on' ? 1 : 0], function(err) {
    if (err) {
      console.error(err.message);
      res.send("Error booking private lesson.");
    } else {
      res.redirect('/private-lesson-schedule');
    }
  });
});

// ===== START THE SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});