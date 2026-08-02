import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin, Compass, Briefcase, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <Link to="/" className="nav-logo" style={{ textDecoration: "none", marginBottom: 16 }}>
              <div className="nav-logo-icon">
                <Home size={18} color="#fff" />
              </div>
              <span>Connexerv</span>
            </Link>
            <p className="footer-desc">
              The premier platform connecting verified service providers with clients across Ethiopia.
              Book trusted plumbers, electricians, tutors, cleaners and more in minutes.
            </p>
            <div className="footer-trust-badge">
              <ShieldCheck size={16} color="var(--green)" />
              <span>100% Verified Local Professionals</span>
            </div>
          </div>

          {/* Quick Links - Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li>
                <Link to="/providers"><Compass size={14} /> Browse Providers</Link>
              </li>
              <li>
                <Link to="/jobs"><Briefcase size={14} /> Job Board</Link>
              </li>
              <li>
                <Link to="/dashboard"><LayoutDashboard size={14} /> Dashboard</Link>
              </li>
              <li>
                <Link to="/register">Get Started</Link>
              </li>
            </ul>
          </div>

          {/* Top Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">Popular Services</h4>
            <ul className="footer-links">
              <li><Link to="/providers">Plumbing & Pipe Repair</Link></li>
              <li><Link to="/providers">Electrical Services</Link></li>
              <li><Link to="/providers">Home & Office Cleaning</Link></li>
              <li><Link to="/providers">Private Tutoring</Link></li>
              <li><Link to="/providers">Appliance Repair</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact & Support</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={16} className="footer-contact-icon" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li>
                <Mail size={16} className="footer-contact-icon" />
                <span>support@connexerv.et</span>
              </li>
              <li>
                <Phone size={16} className="footer-contact-icon" />
                <span>+251 911 000 000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
