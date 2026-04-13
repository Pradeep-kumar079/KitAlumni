import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./SinglePost.css";

const base_url = "https://pradeepkumar.site";

const SinglePost = () => {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);

  // ================= AUTH =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // ================= IMAGE =================
  const renderImage = useCallback((img) => {
    if (!img) return "";
    if (img.startsWith("https")) return img;
    if (img.startsWith("/uploads")) return `${base_url}${img}`;
    return `${base_url}/uploads/${img}`;
  }, []);

  // ================= FETCH =================
  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get(`${base_url}/api/user/post/${id}`);
      if (res.data.success) {
        setPost(res.data.post);
        setComments(res.data.post.comments || []);
      }
    } catch (err) {
      console.error("Fetch Post Error:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // ================= COMMENT =================
  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        alert("Please login to comment");
        return;
      }

      if (!comment.trim()) return;

      try {
        const res = await axios.post(
          `${base_url}/api/user/comment/${id}`,
          { comment }
        );

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

  // ================= MEMO COMMENTS =================
  const renderedComments = useMemo(() => {
    return comments.map((c, idx) => (
      <div key={idx} className="sp-comment">
        <div className="sp-comment-avatar">
          {c.username?.charAt(0).toUpperCase()}
        </div>
        <div className="sp-comment-content">
          <strong>{c.username || "User"}</strong>
          <p>{c.text}</p>
        </div>
      </div>
    ));
  }, [comments]);

  if (!post) return <div className="sp-loading">Loading post...</div>;

  return (
    <div className="sp-wrapper">
      <div className="sp-card">

        {/* HEADER */}
        <div className="sp-header">
          <h2>{post.title}</h2>
          <span className="sp-time">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        {/* CONTENT */}
        <p className="sp-description">{post.description}</p>

        {post.postimg && (
          <img
            src={renderImage(post.postimg)}
            alt=""
            className="sp-image"
          />
        )}

        {/* ACTION */}
        <div className="sp-actions">
          👍 {post.likes?.length || 0} Likes
        </div>

        {/* COMMENTS */}
        <div className="sp-comments">
          <h3>Comments</h3>

          <form onSubmit={handleCommentSubmit} className="sp-form">
            <textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>

          <div className="sp-comment-list">
            {comments.length > 0 ? (
              renderedComments
            ) : (
              <p className="sp-empty">No comments yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(SinglePost);