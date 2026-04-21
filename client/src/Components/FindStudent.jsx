import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./FindStudent.css";

const FindStudent = () => {
  const { admissionyear } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await API.get(`/student/all-students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success && Array.isArray(res.data.students)) {
          const filtered = res.data.students.filter(
            (s) => s.admissionyear?.toString() === admissionyear
          );
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.id || payload._id || payload.userId);
          setStudents(filtered);
        }
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [admissionyear]);

  const handleRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/student/send-request`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleDisconnect = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/student/disconnect`,
        { targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("🔌 Disconnected successfully!");
        setStudents((prev) =>
          prev.map((s) =>
            s._id === targetUserId
              ? {
                  ...s,
                  connections: s.connections.filter((id) => id !== currentUserId),
                }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  if (loading) return <div className="loading">Loading students…</div>;
  if (!students.length)
    return <div className="no-batch">No students found for batch {admissionyear}</div>;

  const grouped = students.reduce((acc, s) => {
    if (!acc[s.branch]) acc[s.branch] = [];
    acc[s.branch].push(s);
    return acc;
  }, {});

  return (
    <div className="batch-container">
      <h2 id="mainheading">Students — Batch {admissionyear}</h2>

      {Object.entries(grouped).map(([branch, list]) => (
        <div key={branch} className="branch-group">
          <h3>Department of {branch}</h3>

          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Admission Year</th>
                  <th>USN</th>
                  <th>Email</th>
                  <th>Connections</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {list.map((s) => {
                  const isConnected = s.connections?.includes(currentUserId);
                  const isSelf = currentUserId === s._id;

                  const statusLabel = isConnected
                    ? "connected"
                    : "none";

                  return (
                    <tr key={s._id}>
                      {/* Profile Image */}
                      <td>
                        <img
                          src={`/uploads/${s.userimg || "default.jpg"}`}
                          alt={s.username}
                          className="profile-img"
                          onClick={() => navigate(`/profile/${s._id}`)}
                        />
                      </td>

                      {/* Name */}
                      <td
                        className="name-cell"
                        onClick={() => navigate(`/profile/${s._id}`)}
                      >
                        {s.username}
                      </td>

                      {/* Role */}
                      <td>
                        <span className="role-badge">{s.role}</span>
                      </td>

                      <td>{s.admissionyear}</td>
                      <td>{s.usn}</td>
                      <td>{s.email}</td>

                      {/* Connections count */}
                      <td>
                        <span className="conn-count">
                          {s.connections?.length || 0}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        {isSelf ? (
                          <span className="status-badge none">Myself</span>
                        ) : isConnected ? (
                          <div className="action-wrap">
                            <button
                              className="disconnect-btn"
                              onClick={() => handleDisconnect(s._id)}
                            >
                              Disconnect
                            </button>
                            <button
                              className="btn-message"
                              onClick={() => navigate(`/chat/${s._id}`)}
                            >
                              Message
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-connect"
                            onClick={() => handleRequest(s._id)}
                          >
                            Connect
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${statusLabel}`}>
                          {isConnected ? "Connected" : "Not Connected"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FindStudent;
