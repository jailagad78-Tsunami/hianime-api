import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
export default function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const handleSearch = (e) => { e.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); };
  const nav = { position:"sticky",top:0,zIndex:100,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",background:"rgba(6,6,11,0.82)",borderBottom:"1px solid rgba(255,255,255,0.06)" };
  const inner = { maxWidth:1400,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",gap:32 };
  return (
    <nav style={nav}>
      <div style={inner}>
        <Link to="/" style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"1rem",color:"#7c3aed",filter:"drop-shadow(0 0 6px #7c3aed)"}}>â–¶</span>
          <span style={{fontFamily:"Bebas Neue,cursive",fontSize:"1.5rem",letterSpacing:"0.1em",background:"linear-gradient(90deg,#f0f0fa,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>HiAnime</span>
        </Link>
        <div style={{display:"flex",gap:24,marginRight:"auto"}}>
          {[["/","Home"],["/search","Discover"]].map(([path,label]) => (
            <Link key={path} to={path} style={{color:location.pathname===path?"#f0f0fa":"#8888aa",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase"}}>{label}</Link>
          ))}
        </div>
        <form onSubmit={handleSearch} style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,overflow:"hidden"}}>
          <input style={{background:"transparent",border:"none",color:"#f0f0fa",fontSize:"0.85rem",padding:"8px 14px",width:220,outline:"none",fontFamily:"inherit"}} placeholder="Search animeâ€¦" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <button type="submit" style={{background:"#7c3aed",border:"none",color:"#fff",padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </form>
      </div>
    </nav>
  );
}
