import React, { useEffect, useState, useCallback } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./AllPosts.css";

import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const renderImage = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `/uploads/${path}`;
  };

  const fetchPosts = useCallback(async () => {
    try {
      const res = await API.get(`/user/allposts?page=${page}&limit=5`);
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
  }, [page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(`/user/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.updatedLikes } : p
        )
      );
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
    }
  };

  const handleComment = async (postId) => {
    const text = prompt("Enter your comment:");
    if (!text) return;
    try {
      const res = await API.post(`/user/comment/${postId}`, { comment: text });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: res.data.updatedComments } : p
        )
      );
    } catch (err) {
      console.error("Comment error:", err.response?.data || err.message);
    }
  };

  const handleShare = (postId) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copied to clipboard!");
  };

  return (
    <div className="feed-wrapper">
      <div className="feed-container">
        {posts.length === 0 && (
          <div className="feed-empty">No posts yet. Check back soon!</div>
        )}

        {posts.map((post) => {
          const user = post.user || {};
          const profileImg =
            user.userimg && !user.userimg.includes("default")
              ? renderImage(user.userimg)
              : null;

          const isLiked = post.likes?.length > 0;

          return (
            <div
              key={post._id}
              className="feed-card"
              onClick={() => navigate(`/post/${post._id}`)}
            >
              {/* HEADER */}
              <div className="feed-header">
                {profileImg ? (
                  <img src={profileImg} alt="" className="feed-avatar" />
                ) : (
                  <div className="feed-avatar fallback-avatar">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="feed-header-text">
                  <h4>{user.username || "User"}</h4>
                  <small>{new Date(post.createdAt).toLocaleString()}</small>
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
                <button
                  className={isLiked ? "active-like" : ""}
                  onClick={(e) => { e.stopPropagation(); handleLike(post._id); }}
                >
                  {isLiked ? <AiFillLike /> : <AiOutlineLike />}
                  <span>{post.likes?.length || 0}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleComment(post._id); }}>
                  <FaRegCommentDots />
                  <span>{post.comments?.length || 0}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleShare(post._id); }}>
                  <FiShare2 />
                  <span>Share</span>
                </button>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div className="load-more-wrap">
            <button
              className="btn-load-more"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
