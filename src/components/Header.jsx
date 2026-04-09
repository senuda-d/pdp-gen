import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img
            src="/favicon/407x407.png"
            alt="PDP AI Logo"
            className="logo-icon"
            style={{ width: 48, height: 48, objectFit: 'contain' }}
          />
          <span>PDP <span className="logo-accent">AI</span></span>
        </Link>
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Generator</Link>
          <a href="#" className="nav-link highlight">Get Started</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
