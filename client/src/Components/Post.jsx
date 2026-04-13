import React, { useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./Post.css";

const Post = () => {
  const BACKEND_URL = "https://pradeepkumar.site";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    postimg: null,
    tags: "",
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
      const response = await axios.post(
        `${BACKEND_URL}/api/user/posts`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("✅ Post created successfully!");
        setFormData({ title: "", description: "", postimg: null, tags: "" });
        setPreview(null);
      }
    } catch (err) {
      console.error("❌ Error creating post:", err.response?.data || err.message);
      alert("⚠️ Error creating post.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="addpost-wrapper">
        <div className="addpost-container">
          <h2>Create a New Post</h2>

          <form className="post-content" onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Post title..."
              required
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Share your thoughts..."
              required
            />

            {/* Image Upload */}
            <label className="file-label">
              Upload Image
              <input
                type="file"
                name="postimg"
                onChange={handleChange}
                accept="image/*"
              />
            </label>

            {/* Preview */}
            {preview && (
              <img src={preview} alt="preview" className="preview-img" />
            )}

            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="#alumni #college"
            />

            <button type="submit">Publish Post 🚀</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Post;