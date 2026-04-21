import React, { useState, useEffect } from "react";
import "./Register.css";
import API from "../api";
import { useNavigate} from "react-router-dom";

const STEP_META = [
  { label: "Email Verification", desc: "Verify your email" },
  { label: "Basic Details",      desc: "Account & branch info" },
  { label: "Personal Details",   desc: "USN & contact" },
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    username: "",
    password: "",
    branch: "",
    admissionyear: "",
    lateralEntry: false,
    role: "student",
    usn: "",
    mobileno: "",
    dob: "",
    termsAccepted: false,
  });

  const [calculatedRole, setCalculatedRole] = useState("student");

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/home");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (name === "admissionyear") newValue = newValue.replace(/\D/, "");
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "admissionyear" || name === "lateralEntry") {
      const currentYear = new Date().getFullYear();
      const admissionYear =
        name === "admissionyear"
          ? parseInt(newValue)
          : parseInt(formData.admissionyear);
      const lateral =
        name === "lateralEntry" ? checked : formData.lateralEntry;
      if (!isNaN(admissionYear)) {
        const courseDuration = lateral ? 3 : 4;
        const role =
          admissionYear + courseDuration <= currentYear ? "alumni" : "student";
        setCalculatedRole(role);
        setFormData((prev) => ({ ...prev, role }));
      }
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return alert("Please enter an email first.");
    try {
      const res = await API.post(`/user/send-otp`, { email: formData.email });
      if (res.data.success) alert("✅ OTP sent successfully to your email!");
      else alert(res.data.message || "Failed to send OTP.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await API.post(`/user/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });
      if (res.data.success) {
        alert("OTP verified successfully!");
        setStep(2);
      } else alert(res.data.message || "Invalid OTP.");
    } catch (err) {
      alert("Error verifying OTP: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted)
      return alert("You must agree to terms before registering.");
    if (!formData.admissionyear || isNaN(parseInt(formData.admissionyear)))
      return alert("Enter a valid admission year.");
    try {
      const finalData = {
        ...formData,
        admissionyear: parseInt(formData.admissionyear),
      };
      const res = await API.post(`/user/register`, finalData);
      if (res.data.success) {
        alert(`Registration successful as ${formData.role.toUpperCase()}!`);
        navigate("/login");
      } else alert(res.data.message || "Registration failed.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="register-page">
      {/* ── Brand panel ── */}
      <div className="reg-brand-panel">
        <div className="reg-brand-inner">
          <div className="reg-brand-badge">Alumni Network</div>

          <div className="reg-brand-content">
            <div className="reg-brand-logo">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="13" fill="rgba(255,255,255,0.15)" />
                <path
                  d="M22 9 L35 15.5 L35 24 C35 31 28.5 36.5 22 38.5 C15.5 36.5 9 31 9 24 L9 15.5 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5 22 L20.5 26 L27.5 19"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="reg-brand-title">Join the<br />Alumni<br />Network.</h1>
            <p className="reg-brand-subtitle">
              Connect with thousands of graduates and students from your college.
              Build your career, your way.
            </p>
          </div>

          {/* Steps visual */}
          <div className="reg-steps-visual">
            {STEP_META.map((s, i) => (
              <React.Fragment key={i}>
                <div className="reg-step-item">
                  <div
                    className={`reg-step-dot ${
                      step === i + 1 ? "active" : step > i + 1 ? "done" : ""
                    }`}
                  >
                    {step > i + 1 ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="reg-step-text">
                    <span className="reg-step-label">{s.label}</span>
                    <span className="reg-step-desc">{s.desc}</span>
                  </div>
                </div>
                {i < STEP_META.length - 1 && <div className="reg-step-line" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="reg-circle reg-circle--lg" />
        <div className="reg-circle reg-circle--sm" />
      </div>

      {/* ── Form panel ── */}
      <div className="reg-form-panel">
        <div className="reg-form-inner">
          {/* Header */}
          <div className="reg-form-eyebrow">Create account</div>
          <h2 className="reg-form-title">Get started for free</h2>
          <p className="reg-form-hint">
            Already have an account?{" "}
            <button className="reg-link" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </p>

          {/* Progress dots */}
          <div className="reg-progress">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div className="reg-prog-step">
                  <div
                    className={`reg-prog-dot ${
                      step === n ? "active" : step > n ? "done" : ""
                    }`}
                  >
                    {step > n ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      n
                    )}
                  </div>
                </div>
                {n < 3 && (
                  <div className={`reg-prog-line ${step > n ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 1: Email Verification ── */}
          {step === 1 && (
            <div>
              <div className="reg-step-heading">
                Verify your email
                <span className="reg-step-badge">Step 1 of 3</span>
              </div>

              <div className="reg-field">
                <label className="reg-field-label">College Email Address</label>
                <div className="reg-otp-row">
                  <div className="reg-field-wrap">
                    <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M2 7l7 4 7-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      className="reg-input"
                      placeholder="yourname@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="button" className="reg-otp-btn" onClick={handleSendOtp}>
                    Send OTP
                  </button>
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-field-label">One-Time Password</label>
                <div className="reg-field-wrap">
                  <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                  </svg>
                  <input
                    type="text"
                    name="otp"
                    className="reg-input"
                    placeholder="Enter the 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
                <span className="reg-helper">Check your inbox — OTP expires in 10 minutes.</span>
              </div>

              <div className="reg-actions">
                <button type="button" className="reg-btn reg-btn--success reg-btn--full" onClick={handleVerifyOtp}>
                  Verify &amp; Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="reg-divider">or</div>

              <button className="reg-btn reg-btn--secondary reg-btn--full" onClick={() => navigate("/login")}>
                Already registered? Sign in
              </button>
            </div>
          )}

          {/* ── Step 2: Basic Details ── */}
          {step === 2 && (
            <div>
              <div className="reg-step-heading">
                Account &amp; branch info
                <span className="reg-step-badge">Step 2 of 3</span>
              </div>

              <div className="reg-grid">
                <div className="reg-field">
                  <label className="reg-field-label">Username</label>
                  <div className="reg-field-wrap">
                    <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M3 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      name="username"
                      className="reg-input"
                      placeholder="Your display name"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-field-label">Password</label>
                  <div className="reg-field-wrap">
                    <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                    </svg>
                    <input
                      type="password"
                      name="password"
                      className="reg-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-field-label">Branch / Department</label>
                  <div className="reg-field-wrap">
                    <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <select
                      name="branch"
                      className="reg-select"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select branch</option>
                      <option value="CSE">CSE</option>
                      <option value="ISE">ISE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="TELCOM">TELCOM</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="AI & ML">AI &amp; ML</option>
                    </select>
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-field-label">Admission Year</label>
                  <div className="reg-field-wrap">
                    <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M6 2v3M12 2v3M2 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      name="admissionyear"
                      className="reg-input"
                      placeholder="e.g. 2021"
                      value={formData.admissionyear}
                      onChange={handleChange}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Lateral entry checkbox */}
              <div className="reg-field" style={{ marginBottom: "12px" }}>
                <label className="reg-checkbox-wrap">
                  <input
                    type="checkbox"
                    name="lateralEntry"
                    checked={formData.lateralEntry}
                    onChange={handleChange}
                  />
                  <span className="reg-checkbox-text">
                    <strong>Lateral Entry</strong> — I joined in 2nd year (3-year course duration)
                  </span>
                </label>
              </div>

              {/* Auto-calculated role */}
              {formData.admissionyear && (
                <div className="reg-role-display">
                  <span className="reg-role-label">Auto-detected role based on year</span>
                  <span className="reg-role-value">{calculatedRole}</span>
                </div>
              )}

              <div className="reg-field">
                <label className="reg-field-label">Role Override</label>
                <div className="reg-field-wrap">
                  <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2l2 5h5l-4 3 1.5 5L9 12l-4.5 3L6 10 2 7h5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  <select
                    name="role"
                    className="reg-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                <span className="reg-helper">Override if auto-detected role is incorrect.</span>
              </div>

              <div className="reg-actions">
                <button type="button" className="reg-btn reg-btn--secondary" onClick={() => setStep(1)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </button>
                <button type="button" className="reg-btn reg-btn--primary" onClick={() => setStep(3)}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Personal Details ── */}
          {step === 3 && (
            <div>
              <div className="reg-step-heading">
                Personal details
                <span className="reg-step-badge">Step 3 of 3</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="reg-grid">
                  <div className="reg-field">
                    <label className="reg-field-label">USN</label>
                    <div className="reg-field-wrap">
                      <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <input
                        type="text"
                        name="usn"
                        className="reg-input"
                        placeholder="e.g. 1AB21CS001"
                        value={formData.usn.toUpperCase()}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="reg-field">
                    <label className="reg-field-label">Mobile Number</label>
                    <div className="reg-field-wrap">
                      <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="5" y="2" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="9" cy="13.5" r="0.8" fill="currentColor" />
                      </svg>
                      <input
                        type="tel"
                        name="mobileno"
                        className="reg-input"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.mobileno}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-field-label">Date of Birth</label>
                  <div className="reg-field-wrap">
                    <svg className="reg-field-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M6 2v3M12 2v3M2 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <input
                      type="date"
                      name="dob"
                      className="reg-input"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="reg-field" style={{ marginBottom: "24px" }}>
                  <label className="reg-checkbox-wrap">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                    />
                    <span className="reg-checkbox-text">
                      I agree to the{" "}
                      <button type="button" className="reg-link">Terms of Service</button>
                      {" "}and{" "}
                      <button type="button" className="reg-link">Privacy Policy</button>.
                      Your data will only be used within the alumni network.
                    </span>
                  </label>
                </div>

                <div className="reg-actions">
                  <button type="button" className="reg-btn reg-btn--secondary" onClick={() => setStep(2)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                  </button>
                  <button type="submit" className="reg-btn reg-btn--primary">
                    Create Account
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="reg-form-footer">
            Protected by college data policy · Alumni Connect © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
