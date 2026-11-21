
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="velocity-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <h2>VELOCITY</h2>
          <p>DRIVE THE IMPOSSIBLE.</p>
        </div>

        <div className="footer-tagline">
          <span>EXPERIENCE THE EXTRAORDINARY</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 VELOCITY. ALL RIGHTS RESERVED.</p>

        <Link to="/admin-login" className="admin-access">
          Admin Access
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
