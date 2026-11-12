

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateNote from "./pages/CreateNote";
import ViewNote from "./pages/ViewNote";
import RevealNote from "./pages/RevealNote";
import YourNotes from "./pages/YourNotes";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";

function AppInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo">🕵️‍♂️</div>
          <h1>RevealX</h1>
        </div>

        <nav className="main-nav">
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/create" className={({ isActive }) => (isActive ? "active" : "")}>
                Create
              </NavLink>
            </li>
            <li>
              <NavLink to="/notes" className={({ isActive }) => (isActive ? "active" : "")}>
                My Messages
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="user-actions">
          {user ? (
            <>
              <span className="user-greeting">Hi, {user.name.split(" ")[0]} 👋</span>
              <button className="btn-login" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => navigate("/login")}>Sign In</button>
              <button className="btn-register" onClick={() => navigate("/register")}>Get Started</button>
            </>
          )}
        </div>
      </header>

      <main className="content-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🌐 PUBLIC route — recipients open this, no login needed */}
          <Route path="/reveal/:token" element={<RevealNote />} />

          {/* 🔒 Protected routes */}
          <Route path="/create" element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><YourNotes /></ProtectedRoute>} />
          <Route path="/notes/:id" element={<ProtectedRoute><ViewNote /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>RevealX</h3>
            <p>Secure Timed Messages — Shared Only at the Right Moment</p>
            <div className="social-icons">
              <button type="button" className="social-button"><span className="social-icon">𝕏</span></button>
              <button type="button" className="social-button"><span className="social-icon">f</span></button>
              <button type="button" className="social-button"><span className="social-icon">in</span></button>
            </div>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><NavLink to="/features">Features</NavLink></li>
              <li><NavLink to="/create">Seal a secret</NavLink></li>
              <li><NavLink to="/notes">My Messages</NavLink></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><NavLink to="/privacy">Privacy Policy</NavLink></li>
              <li><NavLink to="/terms">Terms of Service</NavLink></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for updates</p>
            <div className="newsletter">
              <input type="email" placeholder="Your email address" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RevealX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInner />
      </Router>
    </AuthProvider>
  );
}

export default App;