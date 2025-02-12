import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <header>
        <h1>My Fiddle Shack</h1>
      </header>
      <main>
        <div className="home-buttons">
          <Link to="/private-lessons" className="home-button">Private Lessons</Link>
          <Link to="/monday-sessions-relaxed-pace" className="home-button">Monday Sessions: Relaxed Pace</Link>
          <Link to="/monday-sessions-moving-along" className="home-button">Monday Sessions: Moving Along</Link>
          <Link to="/fiddlers-log" className="home-button">Fiddler's Log</Link>
          <Link to="/login" className="home-button">Sign In</Link>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/private-lessons" element={<h2>Private Lessons Page</h2>} />
        <Route path="/monday-sessions-relaxed-pace" element={<h2>Relaxed Pace Page</h2>} />
        <Route path="/monday-sessions-moving-along" element={<h2>Moving Along Page</h2>} />
        <Route path="/fiddlers-log" element={<h2>Fiddler's Log</h2>} />
        <Route path="/login" element={<h2>Login Page</h2>} />
      </Routes>
    </Router>
  );
}

export default App;