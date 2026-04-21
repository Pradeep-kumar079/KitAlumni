import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/home",     label: "Home" },
  { to: "/about",    label: "About" },
  { to: "/post",     label: "Post" },
  { to: "/students", label: "Students" },
  { to: "/alumni",   label: "Alumni" },
  { to: "/account",  label: "Account" },
];

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="7" fill="rgba(255,255,255,0.18)" />
    <path d="M11 4L18 7.5V12C18 15.5 14.5 18.5 11 19.5C7.5 18.5 4 15.5 4 12V7.5Z"
      fill="none" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8.5 11l2 2L13.5 9" stroke="white" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M5.5 13H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 10.5l3-3-3-3M13 7.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    const fetch = async () => {
      if (!query.trim()) { setResults([]); return; }
      try {
        const res = await API.get(`/search?q=${query}`);
        if (res.data.success) {
          setResults([
            ...(res.data.users || []).map((u) => ({ ...u, type: "user" })),
            ...(res.data.posts || []).map((p) => ({ ...p, type: "post" })),
          ]);
        } else setResults([]);
      } catch { setResults([]); }
    };
    const t = setTimeout(fetch, 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(""); setResults([]);
    if (item.type === "user") navigate(`/profile/${item._id}`);
    else navigate(`/post/${item._id}`);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
        <div className="nav-inner">

          {/* Logo */}
          <button className="nav-logo" onClick={() => navigate("/home")}>
            <ShieldIcon />
            <span className="nav-logo-text">Alumni<span className="nav-logo-accent">Connect</span></span>
          </button>

          {/* Search */}
          <div className="nav-search" ref={searchRef}>
            <span className="nav-search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search people or posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button className="nav-search-clear" onClick={() => { setQuery(""); setResults([]); }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            )}
            {results.length > 0 && (
              <div className="nav-dropdown">
                {results.map((item) => (
                  <div key={item._id} className="nav-dropdown-item" onClick={() => handleSelect(item)}>
                    <img
                      className="nav-dropdown-img"
                      src={item.type === "user"
                        ? (item.userimg ? `/uploads/${item.userimg}` : "/uploads/default.jpg")
                        : (item.postimg ? `/uploads/${item.postimg}` : "/assets/default-post.png")}
                      alt=""
                      onError={(e) => (e.target.src = item.type === "user" ? "/uploads/default.jpg" : "/assets/default-post.png")}
                    />
                    <div className="nav-dropdown-text">
                      <span className="nav-dropdown-name">
                        {item.type === "user" ? item.username : item.title}
                      </span>
                      <span className="nav-dropdown-meta">
                        {item.type === "user"
                          ? `${item.usn || "N/A"} · ${item.role || "Student"}`
                          : item.category || "General"}
                      </span>
                    </div>
                    <span className={`nav-dropdown-pill ${item.type === "user" ? "nav-dropdown-pill--user" : "nav-dropdown-pill--post"}`}>
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop nav links */}
          <div className="nav-links">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? "nav-link--active" : ""}`}
              >
                {label}
              </Link>
            ))}
            <button className="nav-link nav-link--logout" onClick={handleLogout}>
              <LogoutIcon />
              Log out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${mobileOpen ? "nav-drawer--open" : ""}`}>
        <div className="nav-drawer-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-drawer-link ${isActive(to) ? "nav-drawer-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
          <button className="nav-drawer-link nav-drawer-link--logout" onClick={handleLogout}>
            <LogoutIcon />
            Log out
          </button>
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="nav-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
