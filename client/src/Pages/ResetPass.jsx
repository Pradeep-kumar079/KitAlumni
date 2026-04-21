import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./Reset.css";

const ResetPass = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthClass = ["", "weak", "fair", "good", "strong"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return setMsg({ text: "Passwords do not match.", type: "error" });
    if (strength < 2)
      return setMsg({ text: "Please choose a stronger password.", type: "error" });

    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMsg({ text: res.data.message || "Password reset successfully!", type: "success" });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || "Error resetting password. Link may have expired.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      {/* Brand panel */}
      <div className="reset-brand-panel">
        <div className="reset-brand-inner">
          <div className="reset-brand-badge">Alumni Network</div>

          <div className="reset-brand-content">
            <div className="reset-brand-logo">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="13" fill="rgba(255,255,255,0.15)" />
                <path
                  d="M22 9 L35 15.5 L35 24 C35 31 28.5 36.5 22 38.5 C15.5 36.5 9 31 9 24 L9 15.5 Z"
                  fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round"
                />
                <path
                  d="M16.5 22 L20.5 26 L27.5 19"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="reset-brand-title">Secure<br />your<br />account.</h1>
            <p className="reset-brand-subtitle">
              Create a strong new password to keep your alumni profile safe.
            </p>
          </div>

          <div className="reset-tips">
            <p className="reset-tips-title">Password tips</p>
            {[
              ["8+ characters", "Length"],
              ["Uppercase letter", "e.g. A–Z"],
              ["Number", "e.g. 1–9"],
              ["Special character", "e.g. @, #, !"],
            ].map(([label, hint]) => (
              <div className="reset-tip-item" key={label}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                  <path d="M4.5 7l2 2 3-3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="reset-tip-label">{label}</span>
                <span className="reset-tip-hint">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reset-circle reset-circle--lg" />
        <div className="reset-circle reset-circle--sm" />
      </div>

      {/* Form panel */}
      <div className="reset-form-panel">
        <div className="reset-form-inner">
          <div className="reset-form-eyebrow">Account security</div>
          <h2 className="reset-form-title">Reset your password</h2>
          <p className="reset-form-hint">Enter a new password for your account.</p>

          {/* Message banner */}
          {msg.text && (
            <div className={`reset-banner reset-banner--${msg.type}`} role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                {msg.type === "success" ? (
                  <><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M5 8l2.5 2.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>
                ) : (
                  <><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>
                )}
              </svg>
              {msg.text}
              {msg.type === "success" && (
                <span className="reset-redirect-note">Redirecting to login…</span>
              )}
            </div>
          )}

          {!success && (
            <form className="reset-form" onSubmit={handleSubmit} noValidate>
              {/* New password */}
              <div className="reset-field">
                <label className="reset-field-label" htmlFor="password">New Password</label>
                <div className="reset-field-wrap">
                  <svg className="reset-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                  </svg>
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="reset-input"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setMsg({ text: "", type: "" }); }}
                    required
                  />
                  <button type="button" className="reset-toggle" aria-label={showPass ? "Hide" : "Show"}
                    onClick={() => setShowPass(v => !v)}>
                    {showPass ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 2l14 14M7.5 7.7A2 2 0 0 0 10.3 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M4.5 4.8C3.1 5.9 2 7.3 2 9c0 0 2.5 5 7 5a8 8 0 0 0 3.5-.9M7 3.2A8 8 0 0 1 9 3c4.5 0 7 5 7 5a10 10 0 0 1-2 2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 9c0 0 2.5-5 7-5s7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="reset-strength">
                    <div className="reset-strength-bars">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`reset-strength-bar ${strength >= n ? strengthClass : ""}`} />
                      ))}
                    </div>
                    <span className={`reset-strength-label reset-strength-label--${strengthClass}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="reset-field">
                <label className="reset-field-label" htmlFor="confirm">Confirm Password</label>
                <div className="reset-field-wrap">
                  <svg className="reset-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M7 12l1.5 1.5L12 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    className={`reset-input ${
                      confirmPassword && password !== confirmPassword ? "reset-input--error" : ""
                    } ${confirmPassword && password === confirmPassword ? "reset-input--ok" : ""}`}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setMsg({ text: "", type: "" }); }}
                    required
                  />
                  <button type="button" className="reset-toggle" aria-label={showConfirm ? "Hide" : "Show"}
                    onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 2l14 14M7.5 7.7A2 2 0 0 0 10.3 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M4.5 4.8C3.1 5.9 2 7.3 2 9c0 0 2.5 5 7 5a8 8 0 0 0 3.5-.9M7 3.2A8 8 0 0 1 9 3c4.5 0 7 5 7 5a10 10 0 0 1-2 2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 9c0 0 2.5-5 7-5s7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="reset-field-error">Passwords do not match</span>
                )}
              </div>

              <button
                type="submit"
                className={`reset-submit ${loading ? "reset-submit--loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <><span className="reset-spinner" />Resetting password…</>
                ) : (
                  <>
                    Reset Password
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="reset-footer">
            Remember your password?{" "}
            <button className="reset-link" onClick={() => navigate("/login")}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
