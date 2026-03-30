import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} AI PDP Generator. All Rights Reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <span className="dot">•</span>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
