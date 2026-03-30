import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

function Header() {
  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <Sparkles className="logo-icon" size={24} />
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
