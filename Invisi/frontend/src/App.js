// // App.js
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   NavLink,
// } from "react-router-dom";
// import CreateNote from "./CreateNote";
// import ViewNote from "./ViewNote";
// import YourNotes from "./YourNotes";

// import Landing from "./Landing";
// import "./App.css";

// function App() {
//   return (
//     <Router>
//       <div className="app-container">
//         {/* Header */}
//         <header className="app-header">
//           <div className="logo-container">
//             <div className="logo">🕵️‍♂️</div>
//             <h1>RevealX</h1>
//           </div>

//           <nav className="main-nav">
//             <ul>
//               <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
//               <li><NavLink to="/create" className={({ isActive }) => isActive ? "active" : ""}>Create</NavLink></li>
//               <li><NavLink to="/notes" className={({ isActive }) => isActive ? "active" : ""}>My Messages</NavLink></li>
           
//             </ul>
//           </nav>

//           <div className="user-actions">
//             <button className="btn-login">Sign In</button>
//             <button className="btn-register">Get Started</button>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="content-container">
//           <Routes>
//             <Route path="/" element={<Landing />} />
//             <Route path="/create" element={<CreateNote />} />
//             <Route path="/notes" element={<YourNotes />} />
//             <Route path="/notes/:id" element={<ViewNote />} />
    
//           </Routes>
//         </main>

//         {/* Footer */}
//         <footer className="app-footer">
//           <div className="footer-content">
//             <div className="footer-section">
//               <h3>RevealX</h3>
//               <p>Secure Timed Messages — Shared Only at the Right Moment</p>
//               <div className="social-icons">
//                 <a href="#"><span className="social-icon">𝕏</span></a>
//                 <a href="#"><span className="social-icon">f</span></a>
//                 <a href="#"><span className="social-icon">in</span></a>
//               </div>
//             </div>

//             <div className="footer-section">
//               <h4>Product</h4>
//               <ul>
//                 <li><NavLink to="/features">Features</NavLink></li>
//                 {/* <li><NavLink to="/pricing">Pricing</NavLink></li> */}
//                 <li><NavLink to="/create">Seal a secret</NavLink></li>
//                 <li><NavLink to="/notes">My Messages</NavLink></li>
//               </ul>
//             </div>

//             <div className="footer-section">
//               <h4>Company</h4>
//               <ul>
//                 {/* <li><NavLink to="/about">About Us</NavLink></li> */}
             
//                 <li><NavLink to="/privacy">Privacy Policy</NavLink></li>
//                 <li><NavLink to="/terms">Terms of Service</NavLink></li>
//               </ul>
//             </div>

//             <div className="footer-section">
//               <h4>Stay Updated</h4>
//               <p>Subscribe to our newsletter for updates</p>
//               <div className="newsletter">
//                 <input type="email" placeholder="Your email address" />
//                 <button>Subscribe</button>
//               </div>
//             </div>
//           </div>

//           <div className="footer-bottom">
//             <p>&copy; {new Date().getFullYear()} RevealX. All rights reserved.</p>
//           </div>
//         </footer>
//       </div>
//     </Router>
//   );
// }

// export default App;



// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   NavLink,
//   useNavigate,
// } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import CreateNote from "./CreateNote";
// import ViewNote from "./ViewNote";
// import YourNotes from "./YourNotes";
// import Landing from "./Landing";
// import Login from "./Login";
// import Register from "./Register";
// import "./App.css";

// /* ── Inner app that has access to useAuth ── */
// function AppInner() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await logout();
//     navigate("/");
//   };

//   return (
//     <div className="app-container">
//       {/* Header */}
//       <header className="app-header">
//         <div className="logo-container">
//           <div className="logo">🕵️‍♂️</div>
//           <h1>RevealX</h1>
//         </div>

//         <nav className="main-nav">
//           <ul>
//             <li>
//               <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
//                 Home
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/create" className={({ isActive }) => (isActive ? "active" : "")}>
//                 Create
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/notes" className={({ isActive }) => (isActive ? "active" : "")}>
//                 My Messages
//               </NavLink>
//             </li>
//           </ul>
//         </nav>

//         <div className="user-actions">
//           {user ? (
//             <>
//               <span className="user-greeting">Hi, {user.name.split(" ")[0]} 👋</span>
//               <button className="btn-login" onClick={handleLogout}>
//                 Sign Out
//               </button>
//             </>
//           ) : (
//             <>
//               <button className="btn-login" onClick={() => navigate("/login")}>
//                 Sign In
//               </button>
//               <button className="btn-register" onClick={() => navigate("/register")}>
//                 Get Started
//               </button>
//             </>
//           )}
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="content-container">
//         <Routes>
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           {/* 🔒 Protected routes — redirect to /login if not authenticated */}
//           <Route
//             path="/create"
//             element={
//               <ProtectedRoute>
//                 <CreateNote />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/notes"
//             element={
//               <ProtectedRoute>
//                 <YourNotes />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/notes/:id"
//             element={
//               <ProtectedRoute>
//                 <ViewNote />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>

//       {/* Footer */}
//       <footer className="app-footer">
//         <div className="footer-content">
//           <div className="footer-section">
//             <h3>RevealX</h3>
//             <p>Secure Timed Messages — Shared Only at the Right Moment</p>
//             <div className="social-icons">
//               <a href="#"><span className="social-icon">𝕏</span></a>
//               <a href="#"><span className="social-icon">f</span></a>
//               <a href="#"><span className="social-icon">in</span></a>
//             </div>
//           </div>

//           <div className="footer-section">
//             <h4>Product</h4>
//             <ul>
//               <li><NavLink to="/features">Features</NavLink></li>
//               <li><NavLink to="/create">Seal a secret</NavLink></li>
//               <li><NavLink to="/notes">My Messages</NavLink></li>
//             </ul>
//           </div>

//           <div className="footer-section">
//             <h4>Company</h4>
//             <ul>
//               <li><NavLink to="/privacy">Privacy Policy</NavLink></li>
//               <li><NavLink to="/terms">Terms of Service</NavLink></li>
//             </ul>
//           </div>

//           <div className="footer-section">
//             <h4>Stay Updated</h4>
//             <p>Subscribe to our newsletter for updates</p>
//             <div className="newsletter">
//               <input type="email" placeholder="Your email address" />
//               <button>Subscribe</button>
//             </div>
//           </div>
//         </div>

//         <div className="footer-bottom">
//           <p>&copy; {new Date().getFullYear()} RevealX. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// /* ── Root app wraps everything in AuthProvider + Router ── */
// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppInner />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;





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
import CreateNote from "./CreateNote";
import ViewNote from "./ViewNote";
import RevealNote from "./RevealNote";
import YourNotes from "./YourNotes";
import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
import "./App.css";

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
              <a href="#"><span className="social-icon">𝕏</span></a>
              <a href="#"><span className="social-icon">f</span></a>
              <a href="#"><span className="social-icon">in</span></a>
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