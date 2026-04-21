import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ usn: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: name === "usn" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.usn.trim() || !formData.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    localStorage.clear();

    try {
      const res = await API.post("/user/login", {
        usn: formData.usn.trim().toUpperCase(),
        password: formData.password.trim(),
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("role", res.data.user.role);

        const role = res.data.user.role?.toLowerCase();
        window.location.href = role === "admin" ? "/admin" : "/home";
      } else {
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left panel: branding ── */}
      <div className="login-panel login-panel--brand">
        <div className="brand-inner">
          <div className="brand-badge">Alumni Network</div>

          <div className="brand-content">
            <div className="brand-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="12" fill="rgba(255,255,255,0.15)" />
                <path
                  d="M20 8 L32 14 L32 22 C32 28 26 33 20 35 C14 33 8 28 8 22 L8 14 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 20 L18.5 23.5 L25 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="brand-title">Connect.<br />Grow.<br />Belong.</h1>
            <p className="brand-subtitle">
              Your college alumni network — bridging students and graduates
              since 2020.
            </p>
          </div>

          <div className="brand-stats">
            <div className="stat">
              <span className="stat-num">12k+</span>
              <span className="stat-label">Alumni</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">340+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">98%</span>
              <span className="stat-label">Placement</span>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="brand-circle brand-circle--lg" />
        <div className="brand-circle brand-circle--sm" />
      </div>

      {/* ── Right panel: form ── */}
      <div className="login-panel login-panel--form">
        <div className="form-inner">
          {/* Header */}
          <div className="form-header">
            <div className="form-eyebrow">Welcome back</div>
            <h2 className="form-title">Sign in to your account</h2>
            <p className="form-hint">
              New here?{" "}
              <button
                type="button"
                className="text-btn"
                onClick={() => navigate("/register")}
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* USN */}
            <div className="field">
              <label className="field-label" htmlFor="usn">
                USN / Student ID
              </label>
              <div className="field-input-wrap">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  id="usn"
                  type="text"
                  name="usn"
                  className="field-input"
                  placeholder="e.g. 1AB21CS001"
                  value={formData.usn}
                  onChange={handleChange}
                  autoComplete="username"
                  spellCheck={false}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="field-input-wrap">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="field-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
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
            </div>

            {/* Forgot link */}
            <div className="form-meta">
              <button
                type="button"
                className="text-btn text-btn--muted"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`submit-btn ${loading ? "submit-btn--loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="form-footer">
            By signing in, you agree to the{" "}
            <button type="button" className="text-btn text-btn--xs">Terms of Service</button>
            {" "}and{" "}
            <button type="button" className="text-btn text-btn--xs">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
