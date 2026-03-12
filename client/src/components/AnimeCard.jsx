import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function AnimeCard({ anime }) {
  const [imgError, setImgError] = useState(false);
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();
  if (!anime?.id) return null;
  return (
    <div style={{cursor:"pointer",transition:"transform 0.25s,box-shadow 0.25s",borderRadius:10,overflow:"hidden",background:"#12121e",transform:hov?"translateY(-6px) scale(1.02)":"none",boxShadow:hov?"0 16px 40px rgba(124,58,237,0.3)":"none"}}
      onClick={() => navigate(`/anime/${anime.id}`)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{position:"relative",aspectRatio:"2/3",overflow:"hidden",background:"#1a1a2a"}}>
        {!imgError && anime.poster
          ? <img src={anime.poster} alt={anime.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" onError={()=>setImgError(true)} />
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#1e1040,#0a1a2e)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"Bebas Neue,cursive",fontSize:"3rem",color:"rgba(255,255,255,0.15)"}}>{anime.title?.[0]||"?"}</span></div>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(6,6,11,0.95) 0%,transparent 60%)",opacity:hov?1:0,transition:"opacity 0.25s",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:10}}>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {anime.quality && <span style={{background:"#7c3aed",color:"#fff",fontSize:"0.65rem",fontWeight:700,padding:"2px 6px",borderRadius:4}}>{anime.quality}</span>}
            {anime.episodes?.sub>0 && <span style={{background:"#06b6d4",color:"#000",fontSize:"0.65rem",fontWeight:700,padding:"2px 6px",borderRadius:4}}>CC {anime.episodes.sub}</span>}
            {anime.episodes?.dub>0 && <span style={{background:"#f59e0b",color:"#000",fontSize:"0.65rem",fontWeight:700,padding:"2px 6px",borderRadius:4}}>DUB {anime.episodes.dub}</span>}
          </div>
        </div>
        {anime.type && <span style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.75)",color:"#8888aa",fontSize:"0.62rem",fontFamily:"DM Mono,monospace",padding:"2px 6px",borderRadius:4,border:"1px solid rgba(255,255,255,0.08)"}}>{anime.type}</span>}
      </div>
      <div style={{padding:"10px 10px 12px"}}>
        <p style={{fontSize:"0.82rem",fontWeight:500,color:"#d0d0e8",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",lineHeight:1.4}}>{anime.title}</p>
      </div>
    </div>
  );
}
