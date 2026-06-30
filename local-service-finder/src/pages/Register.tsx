import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, AlertCircle, UserCheck, Briefcase } from "lucide-react";

export default function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<"Customer" | "Provider">("Customer");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate(role === "Provider" ? "/provider/setup" : "/providers");
    } catch (err: any) {
      setError(err.response?.data || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { value: "Customer" | "Provider"; icon: React.ReactNode; title: string; desc: string }[] = [
    { value: "Customer", icon: <UserCheck size={22}/>, title: "Customer",  desc: "Browse & book services" },
    { value: "Provider", icon: <Briefcase size={22}/>, title: "Provider",  desc: "Offer your services"    },
  ];

  return (
    <div className="auth-shell" style={{ minHeight: "100vh" }}>

      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="orb orb-purple" style={{ width:300, height:300, top:"-5%",   left:"-10%",  animation:"float 8s ease-in-out infinite" }} />
        <div className="orb orb-teal"   style={{ width:200, height:200, bottom:"8%", right:"-5%",  animation:"float 10s ease-in-out infinite .7s" }} />
        <div className="orb orb-pink"   style={{ width:180, height:180, top:"45%",  left:"60%",   animation:"float 7s ease-in-out infinite 1.2s" }} />

        <div style={{ position:"relative", zIndex:1, textAlign:"center" }} className="anim-fade">
          <h2 style={{ fontSize:38, fontWeight:800, color:"#fff", marginBottom:16, lineHeight:1.15 }}>
            Join <span className="grad-text">LocalFinder</span> today.
          </h2>
          <p style={{ color:"rgba(255,255,255,.55)", maxWidth:300, margin:"0 auto", fontSize:16, lineHeight:1.7 }}>
            Whether you need help around the house, or want to grow your service business — we've got you covered.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, position:"relative", zIndex:1 }}>
          {["Free to join","5 000+ providers","10 000+ bookings","Instant match"].map((text, i) => (
            <div key={i} className="anim-fade" style={{
              animationDelay:`${.15 + i*.08}s`, opacity:0,
              background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)",
              borderRadius:12, padding:"14px 16px", textAlign:"center",
              backdropFilter:"blur(10px)"
            }}>
              <span style={{ color:"#fff", fontWeight:600, fontSize:14 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right register panel ── */}
      <div className="auth-right">
        <div className="auth-box anim-fade">
          <div style={{ marginBottom:32 }}>
            <p style={{ color:"var(--text-muted)", fontSize:13, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Get started for free</p>
            <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-1px", marginBottom:8 }}>Create account</h1>
            <p style={{ color:"var(--text-muted)", fontSize:15 }}>
              Already have one? <Link to="/login" style={{ color:"var(--accent)", fontWeight:600 }}>Sign in →</Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom:20 }}>
              <AlertCircle size={18} style={{ flexShrink:0 }} /> {error}
            </div>
          )}

          {/* Role selector */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
            {roleOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                style={{
                  background: role === opt.value ? "rgba(108,99,255,.15)" : "rgba(255,255,255,.03)",
                  border: `1px solid ${role === opt.value ? "rgba(108,99,255,.5)" : "rgba(255,255,255,.08)"}`,
                  borderRadius:10, padding:"14px 12px", cursor:"pointer", transition:"all .2s",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:6, font:"inherit"
                }}
              >
                <span style={{ color: role === opt.value ? "var(--accent)" : "var(--text-muted)" }}>
                  {opt.icon}
                </span>
                <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{opt.title}</span>
                <span style={{ color:"var(--text-muted)", fontSize:12 }}>{opt.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <div className="form-input-icon-wrap">
                <User size={18} className="input-icon" />
                <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="form-input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom:28 }}>
              <label className="form-label">Password</label>
              <div className="form-input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input type="password" className="form-input" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:"100%", padding:"14px", fontSize:15 }}
              disabled={loading}
            >
              {loading
                ? <span style={{ display:"flex", gap:8, alignItems:"center" }}><span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"spin-slow .7s linear infinite", display:"inline-block" }} /> Creating account…</span>
                : `Create ${role} Account →`
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}