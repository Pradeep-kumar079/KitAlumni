import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "./Navbar";
import "./Account.css";

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedPost, setUpdatedPost] = useState({ title: "", description: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const resUser = await API.get(`/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resUser.data.success) setUser(resUser.data.user);
        const resPosts = await API.get(`/account/posts/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resPosts.data.success) setPosts(resPosts.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditToggle = () => {
    setEditing(!editing);
    setUpdatedUser({ ...user });
    setPreviewImage(null);
    setSelectedImage(null);
  };

  const handleChange = (e) =>
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.keys(updatedUser).forEach((key) => formData.append(key, updatedUser[key]));
      if (selectedImage) formData.append("userimg", selectedImage);
      const res = await API.put(`/account/update`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUser(res.data.user);
        setEditing(false);
        setPreviewImage(null);
        setSelectedImage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await API.put(`/posts/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPosts(posts.map((p) => p._id === postId ? { ...p, liked: !p.liked } : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setUpdatedPost({ title: post.title, description: post.description });
  };

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(`/posts/update/${postId}`, updatedPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPosts(posts.map((p) => (p._id === postId ? res.data.post : p)));
        setEditingPostId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await API.delete(`/posts/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading">Loading your profile…</div>;
  if (!user) return <div className="no-user">No user data found</div>;

  const profileSrc = previewImage
    ? previewImage
    : user.userimg
    ? `/${user.userimg}`
    : `/uploads/default.jpg`;

  const fields = [
    { label: "Full Name",       name: "username",      type: "text",   value: user.username },
    { label: "Email",           name: "email",         type: "email",  value: user.email },
    { label: "Branch",          name: "branch",        type: "text",   value: user.branch },
    { label: "USN",             name: "usn",           type: "text",   value: user.usn },
    { label: "Date of Birth",   name: "dob",           type: "date",   value: user.dob?.slice(0, 10) },
    { label: "Admission Year",  name: "admissionyear", type: "number", value: user.admissionyear },
    { label: "Role",            name: "role",          type: "text",   value: user.role },
  ];

  return (
    <div className="account-container">
      <Navbar />
      <div className="account-content">
        {/* ── Sidebar ── */}
        <div className="left-tabs">
          <img src={profileSrc} alt="Profile" />

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
          <button
            className={activeTab === "posts" ? "active" : ""}
            onClick={() => setActiveTab("posts")}
          >
            My Posts
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Log Out
          </button>
        </div>

        {/* ── Main Content ── */}
        <div className="right-content">
          {activeTab === "profile" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <span className="profile-card-title">
                  {editing ? "Edit Profile" : "Profile Details"}
                </span>
                {!editing ? (
                  <button className="btn-edit" onClick={handleEditToggle}>
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-save" onClick={handleUpdate}>
                      💾 Save Changes
                    </button>
                    <button className="btn-edit" onClick={handleEditToggle}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-fields">
                {fields.map(({ label, name, type, value }) => (
                  <div className="field-group" key={name}>
                    <span className="field-label">{label}</span>
                    {!editing ? (
                      <div className="field-value">{value || "—"}</div>
                    ) : (
                      <input
                        type={type}
                        name={name}
                        defaultValue={updatedUser[name] ?? value}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}

                {editing && (
                  <div className="file-upload-wrap" style={{ gridColumn: "1 / -1" }}>
                    <label>Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                )}

                {previewImage && editing && (
                  <div className="preview-img-wrap">
                    <img src={previewImage} alt="Preview" />
                    <span style={{ fontSize: 13, color: "var(--text-soft)" }}>Preview</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <>
              <h2>My Posts ({posts.length})</h2>
              {posts.length === 0 && (
                <p style={{ color: "var(--text-soft)", fontSize: 14 }}>
                  No posts yet. Share something with the community!
                </p>
              )}
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    {editingPostId === post._id ? (
                      <>
                        <input
                          type="text"
                          value={updatedPost.title}
                          onChange={(e) =>
                            setUpdatedPost({ ...updatedPost, title: e.target.value })
                          }
                          placeholder="Post title"
                        />
                        <textarea
                          value={updatedPost.description}
                          onChange={(e) =>
                            setUpdatedPost({ ...updatedPost, description: e.target.value })
                          }
                          placeholder="Post description"
                        />
                        <div className="post-edit-actions">
                          <button
                            className="btn-save-post"
                            onClick={() => handleSavePost(post._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel-post"
                            onClick={() => setEditingPostId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        {post.postimg && (
                          <div className="post-image-container">
                            <img src={`/uploads/${post.postimg}`} alt="Post" />
                          </div>
                        )}
                        <div className="post-actions">
                          <button
                            className={post.liked ? "btn-like-active" : ""}
                            onClick={() => handleLike(post._id)}
                          >
                            {post.liked ? "👍 Liked" : "👍 Like"}
                          </button>
                          <button onClick={() => handleEditPost(post)}>✏️ Edit</button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
