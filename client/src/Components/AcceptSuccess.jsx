import React from "react";
import "./AcceptRequest.css";

const AcceptSuccess = ({ senderName = "your contact", senderBatch = "", receiverName = "", receiverBatch = "", college = "Alumni Network" }) => {
  const senderInitials = senderName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const receiverInitials = receiverName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "ME";

  return (
    <div className="accept-page">
      <div className="accept-card">
        <div className="accept-icon-ring success-ring">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.5L13.5 21L23 12" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2>Connection accepted!</h2>
        <p>
          You and <strong>{senderName}</strong> are now part of each other's alumni network.
          Stay in touch and grow together.
        </p>

        <div className="accept-avatars">
          <div className="accept-av av-blue">{senderInitials || "PK"}</div>
          <div className="accept-link-line" />
          <div className="accept-av av-green">{receiverInitials}</div>
        </div>

        {(senderBatch || receiverBatch) && (
          <div className="accept-names">
            <div className="accept-name-item">
              <strong>{senderName}</strong>
              {senderBatch && <span>Batch of {senderBatch}</span>}
            </div>
            <div className="accept-name-item">
              <strong>{receiverName || "You"}</strong>
              {receiverBatch && <span>Batch of {receiverBatch}</span>}
            </div>
          </div>
        )}

        <div className="accept-chips">
          {college && <span className="accept-chip">{college}</span>}
          <span className="accept-chip">Alumni Network</span>
        </div>

        <a href="https://pradeepkumar.site" className="accept-portal-btn">
          Go to Alumni Portal
          <svg viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default AcceptSuccess;
