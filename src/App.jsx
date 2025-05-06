import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import pages and components
import IntegrationsPage from './pages/IntegrationsPage';
import OrderForm from './components/OrderForm';

/**
 * Main Application Component
 * 
 * This is the root component of the application that sets up:
 * - Routing with React Router
 * - Sidebar navigation
 * - Main content area with header and footer
 * - Responsive layout with collapsible sidebar
 * 
 * The application structure follows a standard layout with:
 * - Sidebar for navigation
 * - Header with user information
 * - Main content area for page components
 * - Footer with copyright information
 * 
 * @component
 */
function App() {
  /**
   * State to track sidebar visibility
   * Used to toggle the sidebar open/closed on smaller screens
   * 
   * @type {[boolean, Function]}
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * Toggles the sidebar visibility
   * Inverts the current sidebarOpen state
   * 
   * @function toggleSidebar
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="app-container">
        {/* 
         * Sidebar Navigation
         * Contains app title and main navigation links
         * Can be collapsed on smaller screens
         */}
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>Pizza Ops</h2>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/" className="nav-link">
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" className="nav-link">
                  <span className="nav-icon">🍕</span>
                  <span className="nav-text">Orders</span>
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="nav-link">
                  <span className="nav-icon">🔌</span>
                  <span className="nav-text">Integrations</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="nav-link">
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* 
         * Main Content Area
         * Contains header, content, and footer
         * Expands to fill available space when sidebar is collapsed
         */}
        <div className="main-content">
          {/* 
           * Application Header
           * Contains toggle button for sidebar and user profile
           */}
          <header className="app-header">
            <div className="header-left">
              {!sidebarOpen && (
                <button className="sidebar-toggle-header" onClick={toggleSidebar}>
                  ☰
                </button>
              )}
              <h1>Pizza Operations Dashboard</h1>
            </div>
            <div className="header-right">
              <div className="user-profile">
                <span className="user-name">Admin</span>
                <div className="user-avatar">👤</div>
              </div>
            </div>
          </header>

          {/* 
           * Main Content Area
           * Contains the current page component based on route
           */}
          <main className="content-area">
            <Routes>
              {/* Dashboard Home Route */}
              <Route path="/" element={<div>Dashboard Home</div>} />
              
              {/* Orders Route - Shows the OrderForm component */}
              <Route path="/orders" element={<OrderForm />} />
              
              {/* Integrations Route - Shows the IntegrationsPage component */}
              <Route path="/integrations" element={<IntegrationsPage />} />
              
              {/* Settings Route - Placeholder for future implementation */}
              <Route path="/settings" element={<div>Settings Page</div>} />
              
              {/* Catch-all route for 404 Not Found */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </main>

          {/* 
           * Application Footer
           * Contains copyright information with current year
           */}
          <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Pizza Ops Dashboard</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
