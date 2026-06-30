import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/providers");
    } catch (err: any) {
      setError(err.response?.data || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ minHeight: "100vh" }}>

      {/* ── Left decorative panel ── */}
      <div className="auth-left">
        {/* Floating orbs */}
        <div className="orb orb-purple" style={{ width:320, height:320, top:"-10%", left:"-15%", animation:"float 7s ease-in-out infinite" }} />
        <div className="orb orb-teal"   style={{ width:220, height:220, bottom:"5%", right:"-10%",  animation:"float 9s ease-in-out infinite .5s" }} />
        <div className="orb orb-pink"   style={{ width:160, height:160, top:"55%",  left:"55%",    animation:"float 6s ease-in-out infinite 1s" }} />

        {/* Content */}
        <div style={{ position:"relative", zIndex:1, textAlign:"center" }} className="anim-fade">
          <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg,#6C63FF,#A259FF)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 32px", boxShadow:"0 0 40px rgba(108,99,255,.5)", animation:"pulse-glow 3s ease infinite" }}>
            <Sparkles size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize:36, fontWeight:800, color:"#fff", marginBottom:16, lineHeight:1.2 }}>
            Find local help <br/>
            <span className="grad-text-teal">easily.</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,.55)", maxWidth:320, margin:"0 auto", fontSize:16, lineHeight:1.7 }}>
            Find trusted plumbers, electricians, and cleaners near you.
          </p>
        </div>

        {/* Mini feature pills */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, position:"relative", zIndex:1 }}>
          {[
            { icon:"🔒", label:"Checked & Approved Pros"   },
            { icon:"⚡", label:"Book Right Away"      },
            { icon:"⭐", label:"Honest Reviews from Neighbors" },
          ].map((f, i) => (
            <div key={i} className="anim-fade" style={{
              animationDelay: `${.2 + i*.1}s`, opacity:0,
              display:"flex", alignItems:"center", gap:12,
              background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)",
              borderRadius:12, padding:"12px 20px", backdropFilter:"blur(10px)"
            }}>
              <span style={{ fontSize:20 }}>{f.icon}</span>
              <span style={{ color:"#fff", fontWeight:600, fontSize:14 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="auth-right">
        <div className="auth-box anim-fade">
          <div style={{ marginBottom:36 }}>
            <p style={{ color:"var(--text-muted)", fontSize:13, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Welcome back</p>
            <h1 style={{ fontSize:34, fontWeight:800, color:"#fff", letterSpacing:"-1px", marginBottom:8 }}>Log in</h1>
            <p style={{ color:"var(--text-muted)", fontSize:15 }}>
              Don't have an account? <Link to="/register" style={{ color:"var(--accent)", fontWeight:600 }}>Sign up →</Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom:20 }}>
              <AlertCircle size={18} style={{ flexShrink:0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="form-input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom:28 }}>
              <label className="form-label">Password</label>
              <div className="form-input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingRight: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:"100%", padding:"14px", fontSize:15 }}
              disabled={loading}
            >
              {loading
                ? <span style={{ display:"flex", gap:8, alignItems:"center" }}><span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"spin-slow .7s linear infinite", display:"inline-block" }} /> Logging in…</span>
                : <><LogIn size={18}/> Log in</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}