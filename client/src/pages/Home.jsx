import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHome } from "../api/hianime.js";
import SpotlightSlider from "../components/SpotlightSlider.jsx";
import AnimeCard from "../components/AnimeCard.jsx";
export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getHome().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }, []);
  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"60vh"}}><div className="spinner"/></div>;
  if (error) return <div style={{textAlign:"center",padding:"80px 24px",color:"#e11d48"}}>âš  {error}</div>;
  return (
    <div>
      <SpotlightSlider items={data?.spotlight||[]} />
      <div className="container" style={{paddingTop:48,paddingBottom:64}}>
        {data?.trending?.length>0 && <Section title="ðŸ”¥ Trending Now"><TrendingRail items={data.trending}/></Section>}
        {data?.latestEpisodes?.length>0 && <Section title="Latest Episodes"><div className="anime-grid">{data.latestEpisodes.slice(0,18).map(a=><AnimeCard key={a.id} anime={a}/>)}</div></Section>}
        {data?.topAiring?.length>0 && <Section title="Top Airing"><div className="anime-grid">{data.topAiring.slice(0,12).map(a=><AnimeCard key={a.id} anime={a}/>)}</div></Section>}
      </div>
    </div>
  );
}
function Section({ title, children }) {
  return <section style={{marginBottom:56}}><h2 className="section-title" style={{marginBottom:24,fontSize:"1.5rem"}}>{title}</h2>{children}</section>;
}
function TrendingRail({ items }) {
  const navigate = useNavigate();
  return (
    <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
      {items.map((anime,i) => (
        <div key={anime.id} style={{flexShrink:0,width:140,cursor:"pointer",borderRadius:10,overflow:"hidden",background:"#12121e",position:"relative"}} onClick={()=>navigate(`/anime/${anime.id}`)}>
          <span style={{position:"absolute",top:8,left:8,fontFamily:"Bebas Neue,cursive",fontSize:"2.2rem",color:"rgba(255,255,255,0.07)",lineHeight:1,zIndex:1}}>{String(anime.rank||i+1).padStart(2,"0")}</span>
          <div style={{aspectRatio:"2/3",background:"#1a1a2a",overflow:"hidden"}}>
            {anime.poster ? <img src={anime.poster} alt={anime.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/> : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#1e1040,#0a1a2e)"}}/>}
          </div>
          <p style={{padding:"8px 10px 10px",fontSize:"0.78rem",color:"#c0c0da",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",lineHeight:1.4}}>{anime.title}</p>
        </div>
      ))}
    </div>
  );
}
