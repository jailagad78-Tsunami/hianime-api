import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnimeDetail, getEpisodes } from "../api/hianime.js";
import AnimeCard from "../components/AnimeCard.jsx";
const CHUNK = 100;
export default function AnimeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [epLoading, setEpLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [epChunk, setEpChunk] = useState(0);
  useEffect(() => {
    setLoading(true);
    getAnimeDetail(id).then(data => {
      setAnime(data);
      if (data.numericId) { setEpLoading(true); getEpisodes(data.numericId).then(d=>setEpisodes(d.episodes||[])).finally(()=>setEpLoading(false)); }
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  }, [id]);
  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"60vh"}}><div className="spinner"/></div>;
  if (error) return <div style={{textAlign:"center",padding:80,color:"#e11d48"}}>âš  {error}</div>;
  if (!anime) return null;
  const genres = Array.isArray(anime.info?.genre) ? anime.info.genre : anime.info?.genre ? [anime.info.genre] : [];
  const chunks = []; for (let i=0;i<episodes.length;i+=CHUNK) chunks.push(episodes.slice(i,i+CHUNK));
  const visibleEps = chunks[epChunk] || episodes;
  return (
    <div style={{position:"relative",minHeight:"100vh"}}>
      {anime.poster && <div style={{position:"fixed",top:0,left:0,right:0,height:400,backgroundImage:`url(${anime.poster})`,backgroundSize:"cover",backgroundPosition:"center top",filter:"blur(24px) brightness(0.2)",transform:"scale(1.1)",pointerEvents:"none",zIndex:0}}/>}
      <div style={{position:"fixed",top:0,left:0,right:0,height:400,background:"linear-gradient(to bottom,transparent,#06060b 100%)",pointerEvents:"none",zIndex:0}}/>
      <div className="container" style={{position:"relative",zIndex:1,paddingTop:40,paddingBottom:80}}>
        <div style={{display:"flex",gap:40,alignItems:"flex-start",flexWrap:"wrap",marginBottom:56}}>
          <div style={{flexShrink:0,width:220,borderRadius:14,overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.7)"}}>
            <img src={anime.poster} alt={anime.title} style={{width:"100%",display:"block",objectFit:"cover"}} onError={e=>e.currentTarget.style.display="none"}/>
          </div>
          <div style={{flex:1,minWidth:280,paddingTop:8}}>
            <p style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {genres.map(g=><span key={g} style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"#c4b5fd",fontSize:"0.72rem",padding:"3px 10px",borderRadius:20}}>{g}</span>)}
            </p>
            <h1 style={{fontFamily:"Bebas Neue,cursive",fontSize:"clamp(2rem,4vw,3.2rem)",letterSpacing:"0.03em",lineHeight:1.05,marginBottom:4,color:"#f0f0fa"}}>{anime.title}</h1>
            {anime.japaneseName && <p style={{color:"#7c3aed",fontSize:"0.9rem",marginBottom:16}}>{anime.japaneseName}</p>}
            <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
              {anime.quality && <span style={{background:"#7c3aed",color:"#fff",fontSize:"0.72rem",fontFamily:"DM Mono,monospace",fontWeight:700,padding:"4px 10px",borderRadius:4}}>{anime.quality}</span>}
              {anime.episodes?.sub>0 && <span style={{background:"#06b6d4",color:"#000",fontSize:"0.72rem",fontFamily:"DM Mono,monospace",fontWeight:700,padding:"4px 10px",borderRadius:4}}>CC {anime.episodes.sub} eps</span>}
              {anime.episodes?.dub>0 && <span style={{background:"#f59e0b",color:"#000",fontSize:"0.72rem",fontFamily:"DM Mono,monospace",fontWeight:700,padding:"4px 10px",borderRadius:4}}>DUB {anime.episodes.dub} eps</span>}
            </div>
            <p style={{color:"#9090b0",fontSize:"0.9rem",lineHeight:1.7,marginBottom:24,maxWidth:600}}>{anime.description}</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:16}}>
              {Object.entries(anime.info||{}).map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:12,fontSize:"0.85rem",flexWrap:"wrap"}}>
                  <span style={{color:"#666688",minWidth:100,fontWeight:500}}>{k.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</span>
                  <span style={{color:"#c0c0d8",flex:1}}>{Array.isArray(v)?v.join(", "):v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <section style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:40}}>
          <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:20,flexWrap:"wrap"}}>
            <h2 className="section-title" style={{fontSize:"1.4rem"}}>Episodes{episodes.length>0&&<span style={{background:"#1a1a2a",color:"#7c3aed",fontSize:"0.75rem",fontFamily:"DM Mono,monospace",padding:"2px 10px",borderRadius:20,marginLeft:8}}>{episodes.length}</span>}</h2>
            {chunks.length>1 && <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {chunks.map((_,i)=>{ const s=i*CHUNK+1,e=Math.min((i+1)*CHUNK,episodes.length); return <button key={i} style={{background:epChunk===i?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.05)",border:epChunk===i?"1px solid #7c3aed":"1px solid rgba(255,255,255,0.1)",color:epChunk===i?"#c4b5fd":"#8888aa",fontSize:"0.75rem",fontFamily:"DM Mono,monospace",padding:"4px 12px",borderRadius:6,cursor:"pointer"}} onClick={()=>setEpChunk(i)}>{s}â€“{e}</button>; })}
            </div>}
          </div>
          {epLoading && <div style={{padding:40,display:"flex",justifyContent:"center"}}><div className="spinner"/></div>}
          {!epLoading && visibleEps.length>0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {visibleEps.map(ep=><EpBtn key={ep.episodeId} ep={ep} onClick={()=>navigate(`/watch/${id}?ep=${ep.episodeId}`)}/>)}
            </div>
          )}
        </section>
        {anime.related?.length>0 && (
          <section style={{marginTop:48}}>
            <h2 className="section-title" style={{fontSize:"1.4rem",marginBottom:20}}>You Might Also Like</h2>
            <div className="anime-grid">{anime.related.slice(0,12).map(a=><AnimeCard key={a.id} anime={a}/>)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
function EpBtn({ ep, onClick }) {
  const [hov, setHov] = useState(false);
  return <button style={{width:52,height:52,background:hov?"#7c3aed":"#12121e",border:hov?"1px solid #9d5ff5":"1px solid rgba(255,255,255,0.08)",color:hov?"#fff":ep.isFiller?"#444466":"#c0c0d8",borderRadius:8,fontFamily:"DM Mono,monospace",fontSize:"0.82rem",cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick} title={ep.title}>{ep.number}</button>;
}
