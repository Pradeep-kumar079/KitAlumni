import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "./AllPosts.css";

// ICONS
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

const BACKEND_URL = "https://kitalumni-backend.onrender.com";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  // ================= IMAGE =================
  const renderImage = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/uploads/${path}`;
  };

  // ================= FETCH POSTS =================
  const fetchPosts = async () => {
    try {
      const res = await api.get(`/user/allposts?page=${page}&limit=5`);

      if (res.data.success) {
        if (res.data.posts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...res.data.posts]);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  // ================= LIKE =================
  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/user/like/${postId}`);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: res.data.updatedLikes }
            : p
        )
      );
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
    }
  };

  // ================= COMMENT =================
  const handleComment = async (postId) => {
    const text = prompt("Enter your comment:");
    if (!text) return;

    try {
      const res = await api.post(`/user/comment/${postId}`, {
        comment: text,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: res.data.updatedComments }
            : p
        )
      );
    } catch (err) {
      console.error("Comment error:", err.response?.data || err.message);
    }
  };

  // ================= SHARE =================
  const handleShare = (postId) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copied!");
  };

  return (
    <div className="feed-wrapper">
      <div className="feed-container">

        {posts.map((post) => {
          const user = post.user || {};
          const profileImg = renderImage(user.userimg);

          return (
            <div
              key={post._id}
              className="feed-card"
              onClick={() => navigate(`/post/${post._id}`)}
            >

              {/* HEADER */}
              <div className="feed-header">

                {/* AVATAR */}
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt=""
                    className="feed-avatar"
                  />
                ) : (
                  <div className="feed-avatar fallback-avatar">
                    {user.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}

                <div>
                  <h4>{user.username || "User"}</h4>
                  <small>
                    {new Date(post.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>

              {/* CONTENT */}
              <div className="feed-content">
                {post.title && <h3>{post.title}</h3>}
                {post.description && <p>{post.description}</p>}

                {post.postimg && (
                  <img
                    src={renderImage(post.postimg)}
                    alt=""
                    className="feed-image"
                  />
                )}
              </div>

              {/* ACTIONS */}
              <div className="feed-actions">

                {/* LIKE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(post._id);
                  }}
                  className={post.likes?.length > 0 ? "active-like" : ""}
                >
                  {post.likes?.length > 0 ? <AiFillLike /> : <AiOutlineLike />}
                  <span>{post.likes?.length || 0}</span>
                </button>

                {/* COMMENT */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComment(post._id);
                  }}
                >
                  <FaRegCommentDots />
                  <span>{post.comments?.length || 0}</span>
                </button>

                {/* SHARE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(post._id);
                  }}
                >
                  <FiShare2 />
                  <span>Share</span>
                </button>

              </div>

            </div>
          );
        })}

        {/* LOAD MORE */}
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#3b82f6",
                color: "white",
                cursor: "pointer",
              }}
            >
              Load More
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllPosts;