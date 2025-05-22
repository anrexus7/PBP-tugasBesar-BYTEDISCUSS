import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">DevForum</Link>
        <nav className="nav">
          <Link to="/questions" className="nav-link">Questions</Link>
          <Link to="/tags" className="nav-link">Tags</Link>
          <Link to="/ask" className="nav-link">Ask Question</Link>
        </nav>
        <div className="user-menu">
          <div className="avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button onClick={handleLogout} className="btn btn-sm btn-outline">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;