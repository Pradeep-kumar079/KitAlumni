import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Gallery.css";

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const navigate = useNavigate();

  const fetchGallery = async () => {
    try {
      const res = await API.get(`/user/gallery`);
      if (res.data.success) setGallery(res.data.gallery);
    } catch (err) {
      console.error("❌ Fetch Gallery Error:", err);
    }
  };

  useEffect(() => {
    fetchGallery();
    const interval = setInterval(fetchGallery, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("https")) return img;
    if (img.startsWith("/uploads")) return img;
    return `/uploads/${img}`;
  };

  return (
    <div className="gallery-page">
      <div className="gallery-page-header">
        <h2>
          <span className="emoji">🎉</span>
          College Announcements &amp; Gallery
        </h2>
        <p className="gallery-subtitle">
          Stay updated with the latest news, events, and memories
        </p>
      </div>

      <div className="gallery-grid">
        {gallery.length === 0 ? (
          <p className="gallery-empty">No announcements yet. Check back soon!</p>
        ) : (
          gallery.map((item) => (
            <div
              key={item._id}
              className="gallery-card"
              onClick={() => navigate(`/gallery/${item._id}`)}
            >
              {item.image ? (
                <div className="gallery-image-wrap">
                  <img
                    src={renderImg(item.image)}
                    alt={item.title}
                    className="gallery-image"
                  />
                </div>
              ) : (
                <div className="gallery-no-image">📢</div>
              )}

              <div className="gallery-info">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
