import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import type { Provider } from "../types";
import { MapPin, Search, ArrowRight, Star, Compass } from "lucide-react";

export default function Providers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get("search") || "";

    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    useEffect(() => {
        const query = searchParams.get("search") || "";
        setSearchQuery(query);
        fetchProviders(query);
    }, [searchParams]);

    const fetchProviders = async (search = "") => {
        setLoading(true);
        try {
            const res = await api.get(`/Providers${search ? `?search=${search}` : ""}`);
            setProviders(res.data);
        } catch { /* empty */ }
        finally { setLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ search: searchQuery });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="page-wrap">
            <div className="container">

                {/* ── Page Header & Search Bar ── */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 24,
                    marginBottom: 40,
                    flexWrap: "wrap"
                }}>
                    <div>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: ".1em",
                            marginBottom: 8
                        }}>
                            <Compass size={16} /> Service Directory
                        </div>
                        <h1 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                            Browse Providers
                        </h1>
                        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, margin: 0 }}>
                            {providers.length > 0
                                ? `Showing ${providers.length} service professional${providers.length !== 1 ? "s" : ""} across Ethiopia`
                                : "No service providers found"}
                        </p>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="search-bar" style={{ width: "100%", maxWidth: 420 }}>
                        <div className="form-input-icon-wrap" style={{ flex: 1 }}>
                            <Search size={18} className="input-icon" />
                            <input
                                id="browse-search"
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
                </div>

                {/* ── Active Search Tag ── */}
                {initialQuery && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Active search:</span>
                        <span className="badge badge-accent" style={{ fontSize: 13, padding: "6px 14px" }}>
                            "{initialQuery}"
                        </span>
                        <button
                            onClick={() => { setSearchQuery(""); setSearchParams({}); }}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* ── Provider Grid ── */}
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card card-pad skeleton" style={{ height: 230, opacity: .5 }} />
                        ))}
                    </div>
                ) : providers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                        <h3 style={{ marginBottom: 8, color: "var(--text-heading)" }}>No providers found</h3>
                        <p style={{ marginBottom: 24, color: "var(--text-muted)" }}>
                            Try searching for something else or clear the filter.
                        </p>
                        <button
                            className="btn btn-ghost"
                            onClick={() => { setSearchQuery(""); setSearchParams({}); }}
                        >
                            Show all providers
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
                        {providers.map((provider, idx) => (
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
                                        {(provider.services?.length ?? 0) > 3 && (
                                            <span className="badge" style={{
                                                background: "var(--surface-2)",
                                                color: "var(--text-muted)",
                                                border: "1px solid var(--border)"
                                            }}>
                                                +{provider.services!.length - 3} more
                                            </span>
                                        )}
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
                )}
            </div>
        </div>
    );
}
