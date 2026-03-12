import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchAnime } from "../api/hianime.js";
import AnimeCard from "../components/AnimeCard.jsx";
export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setPage(1); }, [query]);
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true); setError("");
    searchAnime(query, page).then(d=>{ setResults(d.results||[]); setTotal(d.totalResults||0); setHasNext(d.hasNextPage||false); }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  }, [query, page]);
  return (
    <div className="container" style={{paddingTop:40,paddingBottom:64,minHeight:"80vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32,flexWrap:"wrap"}}>
        <h1 className="section-title" style={{fontSize:"1.6rem"}}>{query?`Results for "${query}"`:"Search Anime"}</h1>
        {total>0 && <span style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)",color:"#c4b5fd",fontSize:"0.78rem",fontFamily:"DM Mono,monospace",padding:"4px 12px",borderRadius:20}}>{total} found</span>}
      </div>
      {!query && <div style={{textAlign:"center",padding:"80px 24px"}}><div style={{fontSize:"3rem",marginBottom:16}}>ðŸ”</div><p style={{color:"#888"}}>Use the search bar above</p></div>}
      {loading && <div style={{display:"flex",justifyContent:"center",padding:80}}><div className="spinner"/></div>}
      {error && <div style={{color:"#e11d48",textAlign:"center",padding:"60px 24px"}}>âš  {error}</div>}
      {!loading && results.length>0 && <>
        <div className="anime-grid fade-up">{results.map(a=><AnimeCard key={a.id} anime={a}/>)}</div>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:16,marginTop:48}}>
          <button style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#d0d0e8",padding:"10px 24px",borderRadius:8,fontFamily:"inherit",fontSize:"0.88rem",cursor:"pointer",opacity:page<=1?0.3:1}} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>â† Prev</button>
          <span style={{color:"#6666aa",fontFamily:"DM Mono,monospace",fontSize:"0.85rem"}}>Page {page}</span>
          <button style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#d0d0e8",padding:"10px 24px",borderRadius:8,fontFamily:"inherit",fontSize:"0.88rem",cursor:"pointer",opacity:!hasNext?0.3:1}} onClick={()=>setPage(p=>p+1)} disabled={!hasNext}>Next â†’</button>
        </div>
      </>}
      {!loading && query && results.length===0 && !error && <div style={{textAlign:"center",padding:"80px 24px"}}><div style={{fontSize:"3rem",marginBottom:16}}>ðŸ˜”</div><p style={{color:"#888"}}>No results for "{query}"</p></div>}
    </div>
  );
}
