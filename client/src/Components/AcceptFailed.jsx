import React from "react";
import { useNavigate } from "react-router-dom";
import "./AcceptRequest.css";

const AcceptFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="accept-page">
      <div className="accept-card error">
        <div className="accept-icon-ring error-ring">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 11l10 10M21 11L11 21"
              stroke="#A32D2D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2>Request failed</h2>
        <p>
          This link may have expired or already been used. Please ask the sender
          to resend a fresh connection request.
        </p>

        <button className="accept-home-btn" onClick={() => navigate("/home")}>
          <svg viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2L2 7h2v5h6V7h2L7 2z"
              stroke="#1c2b3a"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </button>
      </div>
    </div>
  );
};

export default AcceptFailed;
