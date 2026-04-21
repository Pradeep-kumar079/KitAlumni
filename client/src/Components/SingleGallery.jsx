import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./SingleGallery.css";

const SingleGallery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [galleryItem, setGalleryItem] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/user/gallery/${id}`);
        if (res.data.success) setGalleryItem(res.data.item);
      } catch (err) {
        console.error("❌ Single Gallery Fetch Error:", err);
      }
    };
    fetchItem();
  }, [id]);

  const renderImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return img;
    return `/uploads/${img}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!galleryItem) {
    return (
      <div className="sg-page">
        <div className="sg-skeleton">
          <div className="sk-back" />
          <div className="sk-image" />
          <div className="sk-line sk-title" />
          <div className="sk-line sk-desc" />
          <div className="sk-line sk-desc short" />
        </div>
      </div>
    );
  }

  return (
    <div className="sg-page">
      {/* Ambient background blob */}
      <div className="sg-blob" aria-hidden="true" />

      <div className="sg-inner">
        {/* Back button */}
        <button className="sg-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Gallery
        </button>

        <article className="sg-card">
          {/* Image panel */}
          <div className={`sg-image-wrap ${imgLoaded ? "loaded" : ""}`}>
            {galleryItem.image && (
              <img
                src={renderImg(galleryItem.image)}
                alt={galleryItem.title}
                className="sg-image"
                onLoad={() => setImgLoaded(true)}
              />
            )}
            {!imgLoaded && <div className="sg-img-placeholder" />}

            {/* Date badge overlay */}
            <div className="sg-date-badge">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {formatDate(galleryItem.createdAt)}
            </div>
          </div>

          {/* Info panel */}
          <div className="sg-info">
            <div className="sg-label">Alumni Moments</div>

            <h1 className="sg-title">{galleryItem.title}</h1>

            {galleryItem.description && (
              <p className="sg-description">{galleryItem.description}</p>
            )}

            <div className="sg-divider" />

            <div className="sg-meta">
              <div className="sg-meta-item">
                <span className="sg-meta-label">Added on</span>
                <span className="sg-meta-value">{formatDate(galleryItem.createdAt)}</span>
              </div>
              {galleryItem.uploadedBy && (
                <div className="sg-meta-item">
                  <span className="sg-meta-label">Uploaded by</span>
                  <span className="sg-meta-value">{galleryItem.uploadedBy}</span>
                </div>
              )}
            </div>

            <div className="sg-actions">
              <button className="sg-share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="15" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="15" cy="16" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 9l6-3.5M7 11l6 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Share
              </button>
              <button className="sg-back-alt-btn" onClick={() => navigate(-1)}>
                View All Photos
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default SingleGallery;
