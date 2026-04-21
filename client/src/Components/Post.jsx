import React, { useState } from "react";
import Navbar from "./Navbar";
import API from "../api";
import "./Post.css";

const Post = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    postimg: null,
    tags: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removePreview = () => {
    setPreview(null);
    setFormData({ ...formData, postimg: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("tags", formData.tags);
    if (formData.postimg) data.append("postimg", formData.postimg);

    try {
      setLoading(true);
      const response = await API.post(`/user/posts`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        alert("Post published successfully!");
        setFormData({ title: "", description: "", postimg: null, tags: "" });
        setPreview(null);
      }
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
      alert("Error creating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="addpost-wrapper">
        <div className="addpost-container">

          {/* ── HEADER ── */}
          <div className="addpost-header">
            <h2>Share with Your Network</h2>
            <p>Post updates, opportunities, and insights with alumni</p>
          </div>

          {/* ── FORM BODY ── */}
          <div className="addpost-body">
            <form className="post-content" onSubmit={handleSubmit}>

              {/* Title */}
              <div>
                <label className="field-label">Post Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Give your post a headline..."
                  required
                  maxLength={120}
                />
              </div>

              {/* Description */}
              <div>
                <label className="field-label">What's on your mind?</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share your thoughts, experiences, or opportunities..."
                  required
                  maxLength={1000}
                />
                <p className="char-count">
                  {formData.description.length} / 1000
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="field-label">Attach Image</label>
                {!preview ? (
                  <label className="file-label">
                    <div className="upload-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span className="upload-text">Click to upload an image</span>
                    <span className="upload-hint">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      name="postimg"
                      onChange={handleChange}
                      accept="image/*"
                    />
                  </label>
                ) : (
                  <div className="preview-wrap">
                    <img src={preview} alt="preview" className="preview-img" />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={removePreview}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="field-label">Tags</label>
                <div className="tags-wrap">
                  <span className="tags-icon">#</span>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="alumni  college  career  networking"
                  />
                </div>
              </div>

              <div className="form-divider" />

              {/* Submit */}
              <button type="submit" disabled={loading}>
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {loading ? "Publishing…" : "Publish Post"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
