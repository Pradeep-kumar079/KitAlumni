import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "./Navbar";
import "./Profile.css";
import { useParams, useNavigate } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        const currentUserRes = await API.get(`/user/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (currentUserRes.data.success) {
          setCurrentUserId(currentUserRes.data.user._id);
        }

        const res = await API.get(`/user/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const profileUser = res.data.user;
          setUser(profileUser);
          setPosts(res.data.posts || []);
          const connected = profileUser.connections?.includes(
            currentUserRes.data.user._id
          );
          setIsConnected(connected);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err.response || err.message);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/student/send-request`,
        { receiverId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsRequestSent(true);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Request error:", err.response?.data || err.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/student/disconnect`,
        { targetUserId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsConnected(false);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Disconnect error:", err.response?.data || err.message);
    }
  };

  const handleMessage = () => {
    if (!isConnected) {
      alert("You must be connected to message this person.");
      return;
    }
    navigate(`/chat/${userId}`);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="profile-state">Loading profile…</div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="profile-state error">{error}</div>
      </>
    );

  if (!user)
    return (
      <>
        <Navbar />
        <div className="profile-state">No user data found.</div>
      </>
    );

  const avatarSrc = user.userimg
    ? `/uploads/${user.userimg}`
    : `/uploads/default.jpg`;

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-inner">

          {/* ── HERO CARD ── */}
          <div className="profile-hero">
            <div className="profile-cover" />

            <img
              src={avatarSrc}
              alt={user.username}
              className="profile-pic"
            />

            <div className="profile-body">
              <h1 className="profile-name">{user.username}</h1>

              <div className="profile-role-badge">
                {user.role === "alumni" ? "🎓 Alumni" : "🎒 Student"}
              </div>

              {/* Meta pills */}
              <div className="profile-meta">
                <div className="meta-pill">
                  <span className="pill-icon">✉️</span>
                  <span className="pill-label">Email</span>
                  {user.email}
                </div>
                <div className="meta-pill">
                  <span className="pill-icon">📚</span>
                  <span className="pill-label">Branch</span>
                  {user.branch || "N/A"}
                </div>
                <div className="meta-pill">
                  <span className="pill-icon">🗓️</span>
                  <span className="pill-label">Batch</span>
                  {user.admissionyear || "N/A"}
                </div>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-num">{user.connections?.length || 0}</div>
                  <div className="stat-lbl">Connections</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">{posts.length}</div>
                  <div className="stat-lbl">Posts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">
                    {user.admissionyear
                      ? new Date().getFullYear() - parseInt(user.admissionyear)
                      : "—"}
                  </div>
                  <div className="stat-lbl">Yrs Active</div>
                </div>
              </div>

              {/* Action buttons */}
              {currentUserId !== userId && (
                <div className="profile-actions">
                  {isConnected ? (
                    <>
                      <button className="btn-disconnect" onClick={handleDisconnect}>
                        ✕ Disconnect
                      </button>
                      <button className="btn-message" onClick={handleMessage}>
                        💬 Message
                      </button>
                    </>
                  ) : isRequestSent ? (
                    <button className="btn-pending" disabled>
                      ⏳ Request Sent
                    </button>
                  ) : (
                    <button className="btn-connect" onClick={handleSendRequest}>
                      + Connect
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── POSTS SECTION ── */}
          <div className="profile-posts-section">
            <div className="posts-section-header">
              <h2 className="posts-section-title">{user.username}'s Posts</h2>
              {posts.length > 0 && (
                <span className="posts-count-badge">{posts.length}</span>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="posts-empty">
                <div className="posts-empty-icon">📭</div>
                <p>No posts yet.</p>
              </div>
            ) : (
              <div className="post-list">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    {post.postimg && (
                      <img
                        src={`/uploads/${post.postimg}`}
                        alt={post.title}
                        className="post-image"
                      />
                    )}
                    <div className="post-body">
                      <p className="post-title">{post.title}</p>
                      <p className="post-desc">{post.description}</p>
                      <span className="post-date">
                        🕐 {new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;
