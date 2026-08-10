import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Provider } from "../types";
import Footer from "../components/Footer";
import {
    MapPin, Search, ArrowRight, Star, Users, Calendar, Award, LogIn, UserPlus,
    ShieldCheck, MessageSquare, CheckCircle, TrendingUp
} from "lucide-react";

interface SiteStats {
    providerCount: number;
    completedBookingsCount: number;
}

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState<SiteStats | null>(null);

    useEffect(() => {
        fetchTopProviders();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get<SiteStats>("/Stats");
            setStats(res.data);
        } catch { /* empty */ }
    };

    const fetchTopProviders = async () => {
        setLoading(true);
        try {
            const res = await api.get<Provider[]>("/Providers");
            setProviders(res.data);
        } catch { /* empty */ }
        finally { setLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/providers?search=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate("/providers");
        }
    };

    return (
        <div className="page-wrap" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {/* ── Full Width Hero Section ── */}
            <div className="hero-bg-section anim-fade" style={{ borderRadius: 0, margin: "0 0 60px 0", borderLeft: "none", borderRight: "none", borderTop: "none" }}>
                <div className="container">
                    <div className="hero-section">
                        <div className="hero-pill">
                            Connexerv - አሰሪና ሰራተኛ አገናኝ!
                        </div>
                        <h1 className="hero-title">
                            Find the right person<br />
                            <span className="grad-text">for the job.</span>
                        </h1>
                        <p className="hero-sub" style={{ margin: "0 0 32px" }}>
                            Verified plumbers, electricians, cleaners, tutors and more — all across Ethiopia.
                            Book easily, pay fairly, and leave an honest review.
                        </p>

                        {/* CTA buttons for unauthenticated visitors */}
                        {!user && (
                            <div className="hero-cta-row" style={{ marginBottom: 32 }}>
                                <Link to="/register" className="btn btn-primary" style={{ gap: 8, padding: "12px 28px", fontSize: 15 }}>
                                    <UserPlus size={17} /> Get Started — It's Free
                                </Link>
                                <Link to="/login" className="btn btn-ghost" style={{ gap: 8, padding: "12px 24px", fontSize: 15 }}>
                                    <LogIn size={17} /> Log In
                                </Link>
                            </div>
                        )}

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="search-bar" style={{ width: "100%", maxWidth: 560 }}>
                            <div className="form-input-icon-wrap" style={{ flex: 1 }}>
                                <Search size={18} className="input-icon" />
                                <input
                                    id="universal-search"
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by provider, service, or city..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                                Search
                            </button>
                        </form>

                        {/* ── Stats strip inside Hero ── */}
                        <div style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: 48,
                            marginTop: 56,
                            flexWrap: "wrap",
                        }}>
                            {[
                                {
                                    icon: <Users size={20} />,
                                    value: stats ? `${stats.providerCount}+` : "—",
                                    label: "Verified Providers"
                                },
                                {
                                    icon: <Calendar size={20} />,
                                    value: stats ? `${stats.completedBookingsCount}+` : "—",
                                    label: "Jobs Completed"
                                },
                                { icon: <Star size={20} />, value: "4.8★", label: "Average Rating" },
                                { icon: <Award size={20} />, value: "24hrs", label: "Avg. Response Time" },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className={`anim-fade anim-delay${i + 1}`}
                                    style={{ textAlign: "left", minWidth: 120 }}
                                >
                                    <div style={{ color: "var(--accent)", marginBottom: 6, display: "flex", alignItems: "center" }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5, fontWeight: 500 }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* ── FEATURED PROVIDERS PREVIEW ── */}
                <div style={{ marginBottom: 80 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
                                Featured Professionals
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                                Top Service Providers
                            </h2>
                        </div>
                        <Link to="/providers" className="btn btn-ghost" style={{ gap: 8 }}>
                            Browse All Providers <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card card-pad skeleton" style={{ height: 230, opacity: .5 }} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24, marginBottom: 40 }}>
                                {providers.slice(0, 6).map((provider, idx) => (
                                    <Link
                                        to={`/providers/${provider.id}`}
                                        key={provider.id}
                                        style={{ textDecoration: "none", display: "block" }}
                                        className={`anim-fade anim-delay${Math.min(idx % 4 + 1, 4)}`}
                                    >
                                        <div className="card card-pad" style={{ height: "100%", cursor: "pointer" }}>
                                            <div style={{
                                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                                background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
                                                borderRadius: "14px 14px 0 0"
                                            }} />

                                            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                                                <img
                                                    src={provider.profileImage
                                                        || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.user?.name || "P")}&background=6C63FF&color=fff&bold=true&size=128`}
                                                    alt={provider.user?.name}
                                                    className="provider-card-img"
                                                />
                                                <div>
                                                    <h3 style={{ margin: "0 0 4px", fontSize: 17, color: "var(--text-heading)" }}>
                                                        {provider.user?.name}
                                                    </h3>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 13 }}>
                                                        <MapPin size={13} />
                                                        {provider.location || "Location not specified"}
                                                    </div>
                                                </div>
                                            </div>

                                            <p style={{
                                                fontSize: 13, marginBottom: 16, color: "var(--text-muted)", lineHeight: 1.65,
                                                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                            }}>
                                                {provider.bio || "This provider hasn't added a bio yet."}
                                            </p>

                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                                                {provider.services?.slice(0, 3).map(s => (
                                                    <span key={s.id} className="badge badge-accent">{s.category}</span>
                                                ))}
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                                                    <Star size={14} fill="currentColor" />
                                                    <span>Top Rated</span>
                                                </div>
                                                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                                                    View Profile <ArrowRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* See More Button */}
                            <div style={{ textAlign: "center" }}>
                                <Link to="/providers" className="btn btn-primary" style={{ padding: "14px 36px", fontSize: 15 }}>
                                    See More Providers <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* ── ABOUT US / WHY CHOOSE US SECTION ── */}
                <div style={{ margin: "80px 0" }}>
                    <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700,
                            color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12
                        }}>
                            Why Choose Connexerv
                        </div>
                        <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, color: "var(--text-heading)", marginBottom: 16 }}>
                            Built to connect Ethiopia with verified local talent.
                        </h2>
                        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>
                            We bridge the gap between clients looking for trusted work and skilled professionals aiming to grow their business.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
                        {[
                            {
                                icon: <ShieldCheck size={24} />,
                                title: "100% Verified Providers",
                                desc: "Every service professional undergoes profile verification to ensure safety, skill quality, and reliability."
                            },
                            {
                                icon: <MessageSquare size={24} />,
                                title: "Real-Time Chat & Calls",
                                desc: "Communicate directly with providers, share details, schedule visits, and stay updated seamlessly."
                            },
                            {
                                icon: <CheckCircle size={24} />,
                                title: "Fair & Honest Ratings",
                                desc: "Browse genuine user reviews and transparent ratings left by actual clients across your city."
                            },
                            {
                                icon: <TrendingUp size={24} />,
                                title: "Empowering Local Pros",
                                desc: "Providing skilled technicians, tutors, and freelancers direct access to high-quality local jobs."
                            }
                        ].map((item, i) => (
                            <div key={i} className="card card-pad" style={{ padding: 28 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: "rgba(108, 99, 255, 0.12)",
                                    color: "var(--accent)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginBottom: 20
                                }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-heading)", marginBottom: 10 }}>
                                    {item.title}
                                </h3>
                                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CALL TO ACTION (CTA) BANNER ── */}
                <div style={{
                    margin: "0 0 80px",
                    padding: "56px 40px",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, rgba(108, 99, 255, 0.18) 0%, rgba(162, 89, 255, 0.12) 50%, rgba(34, 211, 238, 0.12) 100%)",
                    border: "1px solid var(--border-bright)",
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "center"
                }}>
                    <div style={{ position: "relative", zIndex: 2, maxWidth: 600, margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "var(--text-heading)", marginBottom: 16 }}>
                            Ready to hire or offer your services?
                        </h2>
                        <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.6 }}>
                            Join thousands of satisfied clients and skilled service providers on Connexerv today.
                        </p>
                        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                            {user ? (
                                <Link to="/jobs" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                                    Browse Job Board <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                                        Create Free Account
                                    </Link>
                                    <Link to="/login" className="btn btn-ghost" style={{ padding: "14px 28px", fontSize: 15 }}>
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer renders strictly on Home Page */}
            <Footer />
        </div>
    );
}
