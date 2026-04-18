import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "api";
import "./Navbar.css";
import { FaGraduationCap, FaSignOutAlt, FaUser } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";

const Navbar = () => {
  

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

 const Logout = () => {
  localStorage.clear(); // 🔥 remove everything

    window.location.href = "/login"; 
    
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const res = await API.get(`/api/search?q=${query}`);
        if (res.data.success) {
          const combined = [
            ...(res.data.users || []).map((u) => ({
              ...u,
              type: "user",
            })),
            ...(res.data.posts || []).map((p) => ({
              ...p,
              type: "post",
            })),
          ];
          setResults(combined);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const delay = setTimeout(fetchResults, 400);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (item) => {
    setQuery("");
    setResults([]);
    if (item.type === "user") navigate(`/profile/${item._id}`);
    else navigate(`/post/${item._id}`);
  };

  return (
    <div className="navbar-wrapper">
      <div className="container">
        <div className="logo" onClick={() => navigate("/home")}>
          <h2>Alumni</h2>
        </div>

        <div className="search">
          <FaMagnifyingGlass className="search-icon" style={{color:'white'}} />
          <input
            type="text"
            placeholder="Search users or posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{Color:'white'}}
          />
          {results.length > 0 && (
            <div className="search-dropdown">
              {results.map((item) => (
                <div
                  key={item._id}
                  className="search-item"
                  onClick={() => handleSelect(item)}
                >
                  {item.type === "user" ? (
                    <>
                      <img
                        src={
                          item.userimg
                            ? `/uploads/${item.userimg}`
                            : "/uploads/default.jpg"
                        }
                        alt={item.username || "User"}
                        className="search-img"
                        onError={(e) =>
                          (e.target.src = "/uploads/default.jpg")
                        }
                      />
                      <div className="search-info">
                        <strong>{item.username}</strong>
                        <small>
                          {item.usn || "N/A"} · {item.batch || "Batch"} ·{" "}
                          {item.role || "Role"}
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={
                          item.postimg
                            ? `/uploads/${item.postimg}`
                            : "/assets/default-post.png"
                        }
                        alt={item.title || "Post"}
                        className="search-img"
                        onError={(e) =>
                          (e.target.src = "/assets/default-post.png")
                        }
                      />
                      <div className="search-info">
                        <strong>{item.title}</strong>
                        <small>{item.category || "General"}</small>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="buttons">
          <Link to="/home">
            <button>Home</button>
          </Link>
          <Link to="/about">
            <button>About</button>
          </Link>
          <Link to="/post">
            <button>Post</button>
          </Link>
          <Link to="/students">
            <button>
              <FaUser /> Students
            </button>
          </Link>
          <Link to="/alumni">
            <button>
              <FaGraduationCap /> Alumni
            </button>
          </Link>
          <Link to="/account">
            <button>Account</button>
          </Link>
          <button className="logout" id="logout"  onClick={Logout}>
            <FaSignOutAlt /> Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
