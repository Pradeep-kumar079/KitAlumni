import React, { useState } from "react";
import API from "../api";
import "./FeedbackForm.css";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);

    try {
      const res = await API.post(
        `/user/submit`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Feedback submitted successfully!");
      setMsgType("success");
      setFeedback("");
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("Something went wrong. Please try again.");
      setMsgType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-form-container">
        <h2>Share Your Feedback</h2>
        <p className="feedback-form-subtitle">
          Your thoughts help us improve the alumni connect experience for everyone.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your feedback, suggestions, or ideas here…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Feedback"}
          </button>
        </form>

        {message && (
          <p className={`feedback-message ${msgType}`}>
            {msgType === "success" ? "✅" : "❌"} {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
