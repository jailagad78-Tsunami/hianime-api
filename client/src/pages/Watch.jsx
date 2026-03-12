/**
 * Watch.jsx — Video Streaming Page
 *
 * DATA FLOW:
 *   URL: /watch/:animeId?ep=:episodeId
 *
 *   Step 1: getServers(episodeId) → list of sub/dub servers
 *   Step 2: User selects a server (default: first sub server)
 *           → getStream(serverId) → { embedUrl, sources, tracks, intro }
 *   Step 3: Render video player with the m3u8/mp4 URL
 *           OR render the embed iframe as fallback
 *
 * VIDEO PLAYER LOGIC:
 *   - If sources contain an HLS (.m3u8) URL: use <video> with HLS.js
 *     (HLS.js is loaded from CDN via dynamic import workaround)
 *   - If sources contain an MP4: use plain <video> src
 *   - If neither: fall back to <iframe> embed
 *
 * SERVER SWITCHING:
 *   Clicking a different server updates `selectedServer` state,
 *   which triggers a re-fetch of stream data.
 *
 * SUBTITLE TRACKS:
 *   If the stream response includes subtitle tracks, they are injected
 *   as <track> elements into the <video> element.
 *
 * NAVIGATION:
 *   Prev/Next episode buttons read current episode index from the
 *   episode list (fetched separately). We pass animeId and numericId
 *   from the anime detail call for episode list re-use.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getServers, getStream, getAnimeDetail, getEpisodes } from '../api/hianime.js';

export default function Watch() {
  const { id: animeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const episodeId = searchParams.get('ep');
  const navigate = useNavigate();

  const [servers, setServers] = useState({ sub: [], dub: [], raw: [] });
  const [selectedServer, setSelectedServer] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loadingStream, setLoadingStream] = useState(false);
  const [loadingServers, setLoadingServers] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const currentEpIndex = episodes.findIndex((e) => e.episodeId === episodeId);
  const prevEp = episodes[currentEpIndex - 1];
  const nextEp = episodes[currentEpIndex + 1];

  // Load anime info + episode list (for navigation)
  useEffect(() => {
    getAnimeDetail(animeId).then((data) => {
      setAnimeInfo(data);
      if (data.numericId) {
        getEpisodes(data.numericId).then((epData) =>
          setEpisodes(epData.episodes || [])
        );
      }
    });
  }, [animeId]);

  // Load servers whenever episodeId changes
  useEffect(() => {
    if (!episodeId) return;
    setLoadingServers(true);
    setServers({ sub: [], dub: [], raw: [] });
    setSelectedServer(null);
    setStreamData(null);

    getServers(episodeId)
      .then((data) => {
        setServers(data);
        // Auto-select first sub server
        const first = data.sub?.[0] || data.dub?.[0] || data.raw?.[0];
        if (first) setSelectedServer(first);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingServers(false));
  }, [episodeId]);

  // Load stream when server is selected
  useEffect(() => {
    if (!selectedServer?.id) return;
    setLoadingStream(true);
    setStreamData(null);

    getStream(selectedServer.id)
      .then(setStreamData)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingStream(false));
  }, [selectedServer?.id]);

  // Initialize HLS.js when stream sources are available
  useEffect(() => {
    const m3u8 = streamData?.sources?.find((s) => s.url.includes('.m3u8'));
    if (!m3u8 || !videoRef.current) return;

    // Dynamically load HLS.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
    script.onload = () => {
      if (window.Hls?.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(m3u8.url);
        hls.attachMedia(videoRef.current);
        videoRef.current.__hls = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        videoRef.current.src = m3u8.url;
      }
    };
    document.head.appendChild(script);

    return () => {
      videoRef.current?.__hls?.destroy();
    };
  }, [streamData]);

  const allServers = [
    ...servers.sub.map((s) => ({ ...s, label: `${s.name} (Sub)` })),
    ...servers.dub.map((s) => ({ ...s, label: `${s.name} (Dub)` })),
    ...servers.raw.map((s) => ({ ...s, label: `${s.name} (Raw)` })),
  ];

  const mp4Source = streamData?.sources?.find((s) => !s.url.includes('.m3u8'));
  const m3u8Source = streamData?.sources?.find((s) => s.url.includes('.m3u8'));
  const useIframe = streamData?.embedUrl && !m3u8Source && !mp4Source;

  const currentEp = episodes.find((e) => e.episodeId === episodeId);

  return (
    <div style={styles.page}>
      <div style={styles.layout}>

        {/* ── LEFT: Video + Controls ── */}
        <div style={styles.playerCol}>

          {/* Breadcrumb */}
          <div style={styles.breadcrumb}>
            <Link to="/" style={styles.crumb}>Home</Link>
            <span style={styles.crumbSep}>›</span>
            <Link to={`/anime/${animeId}`} style={styles.crumb}>
              {animeInfo?.title || animeId}
            </Link>
            <span style={styles.crumbSep}>›</span>
            <span style={{ ...styles.crumb, color: '#d0d0e8' }}>
              Episode {currentEp?.number || '?'}
            </span>
          </div>

          {/* Episode title */}
          {currentEp && (
            <h1 style={styles.epTitle}>
              <span style={styles.epNum}>EP {currentEp.number}</span>
              {currentEp.title !== `Episode ${currentEp.number}` && (
                <span style={styles.epTitleText}>{currentEp.title}</span>
              )}
            </h1>
          )}

          {/* Player area */}
          <div style={styles.playerWrap}>
            {(loadingStream || loadingServers) && (
              <div style={styles.playerOverlay}>
                <div className="spinner" />
                <p style={styles.loadingText}>
                  {loadingServers ? 'Fetching servers…' : 'Loading stream…'}
                </p>
              </div>
            )}

            {error && (
              <div style={styles.playerOverlay}>
                <p style={{ color: '#e11d48', fontSize: '0.95rem' }}>⚠ {error}</p>
              </div>
            )}

            {!loadingStream && !error && useIframe && (
              <iframe
                src={streamData.embedUrl}
                style={styles.iframe}
                allowFullScreen
                allow="autoplay; encrypted-media"
                title="Anime Player"
              />
            )}

            {!loadingStream && !error && (m3u8Source || mp4Source) && (
              <video
                ref={videoRef}
                style={styles.video}
                controls
                autoPlay
                src={mp4Source?.url}
              >
                {streamData?.tracks?.map((track, i) => (
                  <track
                    key={i}
                    kind="subtitles"
                    src={track.file}
                    label={track.label}
                    default={track.default || i === 0}
                  />
                ))}
              </video>
            )}

            {!loadingStream && !loadingServers && !streamData && !error && (
              <div style={styles.playerOverlay}>
                <p style={{ color: '#666' }}>Select a server to start watching</p>
              </div>
            )}
          </div>

          {/* Server selector */}
          <div style={styles.serverSection}>
            <p style={styles.serverLabel}>STREAMING SERVERS</p>
            <div style={styles.serverBtns}>
              {loadingServers ? (
                <p style={{ color: '#555', fontSize: '0.85rem' }}>Loading servers…</p>
              ) : (
                allServers.map((server) => (
                  <button
                    key={server.id}
                    style={{
                      ...styles.serverBtn,
                      ...(selectedServer?.id === server.id ? styles.serverBtnActive : {}),
                    }}
                    onClick={() => setSelectedServer(server)}
                  >
                    {server.label}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div style={styles.epNav}>
            <button
              style={{ ...styles.navBtn, opacity: prevEp ? 1 : 0.3 }}
              disabled={!prevEp}
              onClick={() => prevEp && setSearchParams({ ep: prevEp.episodeId })}
            >
              ← Prev Episode
            </button>
            <button
              style={{ ...styles.navBtn, background: nextEp ? 'rgba(124,58,237,0.25)' : undefined, opacity: nextEp ? 1 : 0.3 }}
              disabled={!nextEp}
              onClick={() => nextEp && setSearchParams({ ep: nextEp.episodeId })}
            >
              Next Episode →
            </button>
          </div>
        </div>

        {/* ── RIGHT: Episode List Sidebar ── */}
        <aside style={styles.sidebar}>
          <p style={styles.sidebarLabel}>EPISODES</p>
          <div style={styles.epList}>
            {episodes.map((ep) => (
              <button
                key={ep.episodeId}
                style={{
                  ...styles.sideEpBtn,
                  ...(ep.episodeId === episodeId ? styles.sideEpBtnActive : {}),
                  ...(ep.isFiller ? styles.sideEpFiller : {}),
                }}
                onClick={() => setSearchParams({ ep: ep.episodeId })}
                title={ep.title}
              >
                <span style={styles.epNumLabel}>{ep.number}</span>
                <span style={styles.epTitleLabel}>{ep.title}</span>
                <div style={styles.epSubDub}>
                  {ep.hasSub && <span style={styles.subDot}>S</span>}
                  {ep.hasDub && <span style={styles.dubDot}>D</span>}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#06060b' },
  layout: {
    maxWidth: 1500,
    margin: '0 auto',
    padding: '24px 16px',
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },
  playerCol: { flex: 1, minWidth: 0 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  crumb: { color: '#666688', fontSize: '0.8rem', textDecoration: 'none' },
  crumbSep: { color: '#333355', fontSize: '0.8rem' },
  epTitle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  epNum: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: '1.8rem',
    letterSpacing: '0.08em',
    color: '#7c3aed',
  },
  epTitleText: {
    fontSize: '1rem',
    color: '#b0b0d0',
    fontWeight: 400,
  },
  playerWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    background: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: '0 8px 48px rgba(0,0,0,0.9)',
  },
  playerOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    background: '#0d0d18',
  },
  loadingText: { color: '#666688', fontSize: '0.85rem' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  video: { width: '100%', height: '100%', background: '#000' },
  serverSection: { marginBottom: 20 },
  serverLabel: {
    color: '#44445a',
    fontSize: '0.68rem',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    letterSpacing: '0.1em',
    marginBottom: 10,
  },
  serverBtns: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  serverBtn: {
    background: '#12121e',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#8888aa',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  serverBtnActive: {
    background: 'rgba(124,58,237,0.3)',
    border: '1px solid #7c3aed',
    color: '#c4b5fd',
  },
  epNav: { display: 'flex', gap: 12, justifyContent: 'space-between' },
  navBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#c0c0d8',
    padding: '12px 20px',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  sidebar: {
    width: 300,
    flexShrink: 0,
    background: '#0d0d18',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    height: 'calc(100vh - 100px)',
    position: 'sticky',
    top: 80,
  },
  sidebarLabel: {
    color: '#44445a',
    fontSize: '0.68rem',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    letterSpacing: '0.12em',
    padding: '14px 16px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  epList: { overflowY: 'auto', height: 'calc(100% - 44px)' },
  sideEpBtn: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  sideEpBtnActive: { background: 'rgba(124,58,237,0.2)', borderLeft: '3px solid #7c3aed' },
  sideEpFiller: { opacity: 0.45 },
  epNumLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.78rem',
    color: '#666688',
    minWidth: 26,
    flexShrink: 0,
  },
  epTitleLabel: {
    fontSize: '0.82rem',
    color: '#b0b0cc',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  epSubDub: { display: 'flex', gap: 3, flexShrink: 0 },
  subDot: {
    background: '#06b6d4',
    color: '#000',
    fontSize: '0.6rem',
    fontWeight: 700,
    width: 16, height: 16,
    borderRadius: 3,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dubDot: {
    background: '#f59e0b',
    color: '#000',
    fontSize: '0.6rem',
    fontWeight: 700,
    width: 16, height: 16,
    borderRadius: 3,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
