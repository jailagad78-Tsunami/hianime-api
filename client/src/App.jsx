import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import AnimeDetail from "./pages/AnimeDetail.jsx";
import Watch from "./pages/Watch.jsx";
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="*" element={<div style={{textAlign:"center",padding:"120px 24px",color:"#8888aa"}}><p style={{fontFamily:"Bebas Neue,cursive",fontSize:"4rem",color:"#1a1a2a"}}>404</p><p>Page not found</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}
