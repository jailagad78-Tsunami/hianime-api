import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
export default function SpotlightSlider({ items = [] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!items.length || paused) return;
    timer.current = setInterval(() => setIdx(i => (i + 1) % items.length), 5500);
    return () => clearInterval(timer.current);
  }, [items.length, paused]);
  if (!items.length) return null;
  const cur = items[idx];
  const goTo = (i) => { setIdx(i); clearInterval(timer.current); timer.current = setInterval(() => setIdx(x => (x+1)%items.length), 5500); };
  const s = { root:{position:"relative",height:520,overflow:"hidden",background:"#06060b"}, bg:{position:"absolute",inset:0,backgroundSize:"cover",backgroundPosition:"center top",transition:"opacity 0.7s ease",filter:"blur(2px) brightness(0.3)",transform:"scale(1.04)"}, gradB:{position:"absolute",bottom:0,left:0,right:0,height:"65%",background:"linear-gradient(to top,#06060b 20%,transparent)",pointerEvents:"none"}, gradL:{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(6,6,11,0.9) 0%,rgba(6,6,11,0.4) 50%,transparent 100%)",pointerEvents:"none"}, content:{position:"relative",zIndex:2,maxWidth:1400,margin:"0 auto",padding:"0 24px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:72} };
  return (
    <div style={s.root} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      {items.slice(0,6).map((item,i) => <div key={item.id} style={{...s.bg,opacity:i===idx?1:0,backgroundImage:`url(${item.poster})`}} />)}
      <div style={s.gradB} /><div style={s.gradL} />
      <div style={s.content}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <span style={{background:"rgba(124,58,237,0.3)",border:"1px solid rgba(124,58,237,0.5)",color:"#c4b5fd",fontSize:"0.72rem",fontFamily:"DM Mono,monospace",fontWeight:600,padding:"3px 10px",borderRadius:20}}>#{cur.rank} Spotlight</span>
          {cur.quality && <span style={{background:"#7c3aed",color:"#fff",fontSize:"0.7rem",fontFamily:"DM Mono,monospace",fontWeight:700,padding:"3px 8px",borderRadius:4}}>{cur.quality}</span>}
          {cur.episodes?.sub>0 && <span style={{background:"#06b6d4",color:"#000",fontSize:"0.7rem",fontFamily:"DM Mono,monospace",fontWeight:700,padding:"3px 8px",borderRadius:4}}>CC {cur.episodes.sub}</span>}
          {cur.episodes?.dub>0 && <span style={{background:"#f59e0b",color:"#000",fontSize:"0.7rem",fontFamily:"DM Mono,monospace",fontWeight:700,padding:"3px 8px",borderRadius:4}}>DUB {cur.episodes.dub}</span>}
        </div>
        <h1 style={{fontFamily:"Bebas Neue,cursive",fontSize:"clamp(2.2rem,5vw,3.8rem)",color:"#f0f0fa",lineHeight:1.05,marginBottom:4,maxWidth:600}}>{cur.title}</h1>
        {cur.japaneseName && <p style={{color:"#7c3aed",fontSize:"0.88rem",marginBottom:12}}>{cur.japaneseName}</p>}
        {cur.description && <p style={{color:"#a0a0c0",fontSize:"0.9rem",lineHeight:1.6,maxWidth:480,marginBottom:24}}>{cur.description.length>200?cur.description.slice(0,200)+"â€¦":cur.description}</p>}
        <div style={{display:"flex",gap:12}}>
          <button onClick={()=>navigate(`/anime/${cur.id}`)} style={{background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",border:"none",borderRadius:8,padding:"12px 28px",fontSize:"0.9rem",fontWeight:600,fontFamily:"inherit",cursor:"pointer",boxShadow:"0 4px 20px rgba(124,58,237,0.45)"}}>â–¶ Watch Now</button>
          <button onClick={()=>navigate(`/anime/${cur.id}`)} style={{background:"rgba(255,255,255,0.08)",color:"#d0d0e8",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"12px 24px",fontSize:"0.9rem",fontFamily:"inherit",cursor:"pointer"}}>Details</button>
        </div>
      </div>
      <button style={{position:"absolute",top:"50%",left:24,transform:"translateY(-50%)",zIndex:3,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#f0f0fa",width:40,height:40,borderRadius:"50%",fontSize:"1.4rem",cursor:"pointer"}} onClick={()=>goTo((idx-1+items.length)%items.length)}>â€¹</button>
      <button style={{position:"absolute",top:"50%",right:24,transform:"translateY(-50%)",zIndex:3,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#f0f0fa",width:40,height:40,borderRadius:"50%",fontSize:"1.4rem",cursor:"pointer"}} onClick={()=>goTo((idx+1)%items.length)}>â€º</button>
      <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6,zIndex:3}}>
        {items.slice(0,8).map((_,i) => <button key={i} style={{width:i===idx?22:6,height:6,borderRadius:i===idx?3:"50%",background:i===idx?"#7c3aed":"rgba(255,255,255,0.25)",border:"none",cursor:"pointer",transition:"all 0.2s",padding:0}} onClick={()=>goTo(i)} />)}
      </div>
    </div>
  );
}
