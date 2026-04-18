import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "api";
import "./Reset.css";

const ResetPass = () => {
  

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setMsg("Passwords do not match ❌");
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await API.post(
        `/api/auth/reset-password/${token}`,
        { password }
      );

      setMsg(res.data.message || "Password reset successful ✅");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setMsg(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p>Create a new secure password for your account</p>

        {/* Password */}
        <div className="input-group">
          <input
            type={show ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="toggle" onClick={() => setShow(!show)}>
            {show ? "🙈" : "👁"}
          </span>
        </div>

        {/* Confirm Password */}
        <input
          type={show ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
};

export default ResetPass;