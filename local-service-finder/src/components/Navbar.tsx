import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Home, Compass, LayoutDashboard, Settings, UserCircle } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string) =>
        location.pathname.startsWith(path) ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                {/* Logo */}
                <Link to={user ? "/providers" : "/"} className="nav-logo" style={{ textDecoration: "none" }}>
                    <div className="nav-logo-icon">
                        <Home size={18} color="#fff" />
                    </div>
                    <span>LocalFinder</span>
                </Link>

                {/* Center nav links */}
                <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                    <Link to="/providers" className={isActive("/providers")}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Compass size={16} /> Browse
                        </span>
                    </Link>
                    {user && (
                        <Link to="/dashboard" className={isActive("/dashboard")}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <LayoutDashboard size={16} /> Dashboard
                            </span>
                        </Link>
                    )}
                    {user?.role === "Provider" && (
                        <Link to="/provider/setup" className={isActive("/provider/setup")}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Settings size={16} /> My Services
                            </span>
                        </Link>
                    )}
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {user ? (
                        <>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "rgba(255,255,255,.05)", borderRadius: "99px",
                                padding: "6px 14px 6px 8px", border: "1px solid rgba(255,255,255,.08)"
                            }}>
                                <div style={{
                                    width: "28px", height: "28px", borderRadius: "50%",
                                    background: "linear-gradient(135deg, #6C63FF, #A259FF)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <UserCircle size={18} color="#fff" />
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{user.name}</span>
                                <span style={{
                                    fontSize: "11px", fontWeight: 700, padding: "2px 8px",
                                    borderRadius: "99px", letterSpacing: ".05em",
                                    background: user.role === "Provider" ? "rgba(34,211,238,.15)" : "rgba(108,99,255,.15)",
                                    color: user.role === "Provider" ? "#22d3ee" : "#a78bfa"
                                }}>{user.role.toUpperCase()}</span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "8px 14px", gap: "6px" }}>
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost" style={{ padding: "8px 18px" }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: "8px 18px" }}>Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
