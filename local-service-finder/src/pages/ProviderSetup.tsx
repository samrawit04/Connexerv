import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Settings, PlusCircle, CheckCircle, Briefcase, MapPin, Phone, Image, Tag, FileText, AlignLeft } from "lucide-react";

export default function ProviderSetup() {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [step, setStep]   = useState<1|2>(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<{ title:string; category:string; description:string }[]>([]);

  // Profile state
  const [bio, setBio]               = useState("");
  const [location, setLocation]     = useState("");
  const [phone, setPhone]           = useState("");
  const [profileImage, setImage]    = useState("");

  // Service form state
  const [sTitle, setSTitle] = useState("");
  const [sCat,   setSCat]   = useState("");
  const [sDesc,  setSDesc]  = useState("");

  useEffect(() => {
    if (user && user.role !== "Provider") navigate("/dashboard");
  }, [user, navigate]);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/Providers", { bio, location, phone, profileImage });
      setStep(2);
    } catch (err: any) {
      // might already exist — allow moving on
      if (err.response?.data?.includes("already exists")) {
        setStep(2);
      } else {
        alert(err.response?.data || "Failed to save profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/Services", { title: sTitle, category: sCat, description: sDesc });
      setServices(prev => [...prev, { title: sTitle, category: sCat, description: sDesc }]);
      setSTitle(""); setSCat(""); setSDesc("");
    } catch (err: any) {
      alert(err.response?.data || "Failed to add service.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num:1, label:"Create Profile" },
    { num:2, label:"Add Services"  },
  ];

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:760 }}>

        {/* ── Header ── */}
        <div style={{ textAlign:"center", marginBottom:48 }} className="anim-fade">
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", marginBottom:20, boxShadow:"0 0 40px rgba(108,99,255,.4)" }}>
            <Briefcase size={28} color="#fff"/>
          </div>
          <h1 style={{ fontSize:36, fontWeight:800, marginBottom:12 }}>Provider Setup</h1>
          <p>Complete your profile and add services to start receiving bookings.</p>
        </div>

        {/* ── Step indicator ── */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:0, marginBottom:48 }}>
          {steps.map((s, i) => (
            <>
              <div key={s.num} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div className={`step-dot ${step > s.num ? "done" : step === s.num ? "active" : "idle"}`}>
                  {step > s.num ? <CheckCircle size={18}/> : s.num}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: step === s.num ? "#fff" : "var(--text-muted)" }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width:80, height:2, background: step > s.num ? "var(--green)" : "var(--border)", margin:"0 16px", marginBottom:24, transition:"background .4s" }} />
              )}
            </>
          ))}
        </div>

        {/* ── STEP 1: Profile ── */}
        {step === 1 && (
          <div className="card card-pad anim-fade">
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius:"14px 14px 0 0" }} />
            <h2 style={{ fontSize:22, marginBottom:28, display:"flex", alignItems:"center", gap:10 }}>
              <Settings size={22} color="var(--accent)"/> Your Provider Profile
            </h2>

            <form onSubmit={handleProfile}>
              <div className="form-group">
                <label className="form-label"><AlignLeft size={13}/> Bio / About you</label>
                <textarea className="form-input" rows={4} placeholder="Tell customers about your skills and experience…" value={bio} onChange={e => setBio(e.target.value)} required style={{ resize:"vertical" }} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div className="form-group">
                  <label className="form-label"><MapPin size={13}/> Location</label>
                  <input type="text" className="form-input" placeholder="e.g. New York, NY" value={location} onChange={e => setLocation(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label"><Phone size={13}/> Phone number</label>
                  <input type="tel" className="form-input" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Image size={13}/> Profile photo URL <span style={{ color:"var(--text-faint)", textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
                <input type="url" className="form-input" placeholder="https://example.com/photo.jpg" value={profileImage} onChange={e => setImage(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width:"100%", padding:14, fontSize:15, marginTop:8 }} disabled={loading}>
                {loading
                  ? <span style={{ display:"flex", gap:8, alignItems:"center" }}><span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"spin-slow .7s linear infinite", display:"inline-block" }} /> Saving…</span>
                  : "Save Profile & Continue →"
                }
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Services ── */}
        {step === 2 && (
          <div className="anim-fade" style={{ display:"grid", gap:24 }}>
            {/* Success banner */}
            <div className="alert alert-success" style={{ alignItems:"center" }}>
              <CheckCircle size={20} style={{ flexShrink:0 }}/> Profile saved! Now add the services you offer.
            </div>

            {/* Services added so far */}
            {services.length > 0 && (
              <div>
                <h3 style={{ fontSize:16, marginBottom:14, color:"#fff" }}>Services added ({services.length})</h3>
                <div style={{ display:"grid", gap:10 }}>
                  {services.map((s, i) => (
                    <div key={i} className="card card-pad anim-fade" style={{ padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:600, color:"#fff", marginBottom:2 }}>{s.title}</div>
                        <div style={{ fontSize:13, color:"var(--text-muted)" }}>{s.description}</div>
                      </div>
                      <span className="badge badge-accent">{s.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add service form */}
            <div className="card card-pad">
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--teal),var(--accent))", borderRadius:"14px 14px 0 0" }} />
              <h2 style={{ fontSize:22, marginBottom:28, display:"flex", alignItems:"center", gap:10 }}>
                <PlusCircle size={22} color="var(--accent)"/> Add a Service
              </h2>

              <form onSubmit={handleAddService}>
                <div className="form-group">
                  <label className="form-label"><FileText size={13}/> Service title</label>
                  <input type="text" className="form-input" placeholder="e.g. Premium Pipe Repair" value={sTitle} onChange={e => setSTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label"><Tag size={13}/> Category</label>
                  <input type="text" className="form-input" placeholder="e.g. Plumbing, Electrical, Cleaning…" value={sCat} onChange={e => setSCat(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label"><AlignLeft size={13}/> Description</label>
                  <textarea className="form-input" rows={3} placeholder="Describe what's included in this service…" value={sDesc} onChange={e => setSDesc(e.target.value)} required style={{ resize:"vertical" }} />
                </div>

                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex:1, padding:13 }} disabled={loading}>
                    {loading ? "Adding…" : <><PlusCircle size={16}/> Add Service</>}
                  </button>
                  {services.length > 0 && (
                    <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")} style={{ flex:1, padding:13 }}>
                      Done — Go to Dashboard →
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
