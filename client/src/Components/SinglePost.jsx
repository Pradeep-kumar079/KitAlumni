import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import Navbar from "./Navbar";
import "./SinglePost.css";

const SinglePost = () => {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);

  // ── Auth ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // ── Image helper ──
  const renderImage = useCallback((img) => {
    if (!img) return "";
    if (img.startsWith("https")) return img;
    if (img.startsWith("/uploads")) return img;
    return `/uploads/${img}`;
  }, []);

  // ── Fetch post ──
  const fetchPost = useCallback(async () => {
    try {
      const res = await API.get(`/user/post/${id}`);
      if (res.data.success) {
        setPost(res.data.post);
        setComments(res.data.post.comments || []);
      }
    } catch (err) {
      console.error("Fetch post error:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // ── Comment submit ──
  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) { alert("Please login to comment"); return; }
      if (!comment.trim()) return;

      try {
        const res = await API.post(`/user/comment/${id}`, { comment });
        if (res.data.success) {
          setComments(res.data.updatedComments);
          setComment("");
        }
      } catch (err) {
        console.error(err);
      }
    },
    [comment, id, user]
  );

  // ── Textarea auto-expand ──
  const handleTextarea = (e) => {
    setComment(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // ── Rendered comments ──
  const renderedComments = useMemo(() => {
    return comments.map((c, idx) => (
      <div key={idx} className="sp-comment">
        <div className="sp-comment-avatar">
          {(c.username || "U").charAt(0).toUpperCase()}
        </div>
        <div className="sp-comment-bubble">
          <p className="sp-comment-author">{c.username || "Anonymous"}</p>
          <p className="sp-comment-text">{c.text}</p>
        </div>
      </div>
    ));
  }, [comments]);

  if (!post)
    return (
      <>
        <Navbar />
        <div className="sp-loading">Loading post…</div>
      </>
    );

  const postedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const postedTime = new Date(post.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <Navbar />
      <div className="sp-wrapper">
        <div className="sp-card">

          {/* ── HEADER BAND ── */}
          <div className="sp-header-band">
            <div className="sp-author-row">
              <div className="sp-author-avatar">
                {(post.author?.username || post.username || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="sp-author-info">
                <p className="sp-author-name">
                  {post.author?.username || post.username || "Alumni Member"}
                </p>
                <span className="sp-time">
                  🕐 {postedDate} · {postedTime}
                </span>
              </div>
            </div>
            <h1 className="sp-title">{post.title}</h1>
          </div>

          {/* ── BODY ── */}
          <div className="sp-body">
            <p className="sp-description">{post.description}</p>

            {post.postimg && (
              <div className="sp-image-wrap">
                <img
                  src={renderImage(post.postimg)}
                  alt={post.title}
                  className="sp-image"
                />
              </div>
            )}

            {/* ── ACTIONS BAR ── */}
            <div className="sp-actions-bar">
              <button
                className={`sp-like-btn${liked ? " liked" : ""}`}
                onClick={() => setLiked((p) => !p)}
              >
                {liked ? "❤️" : "🤍"} Like
              </button>
              <span className="sp-like-count">
                {(post.likes?.length || 0) + (liked ? 1 : 0)} likes
              </span>
            </div>
          </div>

          {/* ── COMMENTS ── */}
          <div className="sp-comments-section">
            <h2 className="sp-comments-title">
              Comments
              {comments.length > 0 && (
                <span className="sp-comments-count">{comments.length}</span>
              )}
            </h2>

            {/* Form */}
            <form className="sp-form" onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="Share your thoughts…"
                value={comment}
                onChange={handleTextarea}
                rows={2}
              />
              <button type="submit" className="sp-send-btn" title="Post comment">
                <svg viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {/* Comment list */}
            <div className="sp-comment-list">
              {comments.length > 0 ? (
                renderedComments
              ) : (
                <p className="sp-empty">Be the first to comment 💬</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default React.memo(SinglePost);
