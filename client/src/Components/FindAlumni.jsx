import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./FindStudent.css";

const FindAlumni = () => {
  const { admissionyear } = useParams();
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const defaultImg = "default.jpg";

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload._id || payload.userId);

        const res = await API.get(`/alumni/all-alumni`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          let foundAlumni = [];

          if (Array.isArray(res.data.batches)) {
            const selectedBatch = res.data.batches.find(
              (b) =>
                String(b.batchYear).trim() === String(admissionyear).trim()
            );
            if (selectedBatch && Array.isArray(selectedBatch.alumni)) {
              foundAlumni = selectedBatch.alumni;
            }
          }

          if (foundAlumni.length === 0 && res.data.batches) {
            const allAlumni = res.data.batches.flatMap((b) => b.alumni);
            foundAlumni = allAlumni.filter(
              (a) =>
                String(a.batchYear).trim() === String(admissionyear).trim() ||
                String(a.admissionyear).trim() === String(admissionyear).trim()
            );
          }

          setAlumniList(foundAlumni);
        }
      } catch (err) {
        console.error("❌ Fetch alumni error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, [admissionyear]);

  const handleRequest = async (to) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/alumni/send-request`,
        { to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlumniList((prev) =>
        prev.map((a) =>
          a._id === to
            ? {
                ...a,
                receivedRequests: [
                  ...(a.receivedRequests || []),
                  currentUserId,
                ],
              }
            : a
        )
      );
      alert("✅ Connection request sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  const handleDisconnect = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/alumni/disconnect`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlumniList((prev) =>
        prev.map((a) =>
          a._id === userId
            ? {
                ...a,
                connections: a.connections.filter(
                  (id) => id !== currentUserId
                ),
              }
            : a
        )
      );
      alert("❎ Disconnected successfully!");
    } catch (err) {
      alert("Failed to disconnect.");
    }
  };

  if (loading) return <div className="loading">Loading alumni…</div>;
  if (!alumniList.length)
    return (
      <div className="no-batch">
        No alumni found for batch {admissionyear}
      </div>
    );

  const groupedByBranch = alumniList.reduce((acc, a) => {
    if (!acc[a.branch]) acc[a.branch] = [];
    acc[a.branch].push(a);
    return acc;
  }, {});

  return (
    <div className="batch-container">
      <h2 id="mainheading">Alumni — Batch {admissionyear}</h2>

      {Object.entries(groupedByBranch).map(([branch, list]) => (
        <div key={branch} className="branch-group">
          <h3>Department of {branch}</h3>

          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Batch Year</th>
                  <th>USN</th>
                  <th>Email</th>
                  <th>Connections</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {list.map((alumni) => {
                  const isConnected = alumni.connections?.includes(currentUserId);
                  const isPending  = alumni.receivedRequests?.includes(currentUserId);
                  const isRequested = alumni.sentRequests?.includes(currentUserId);
                  const isSelf = currentUserId === alumni._id;

                  const statusLabel = isConnected
                    ? "connected"
                    : isPending
                    ? "pending"
                    : isRequested
                    ? "requested"
                    : "none";

                  const statusText = isConnected
                    ? "Connected"
                    : isPending
                    ? "Pending"
                    : isRequested
                    ? "Requested"
                    : "Not Connected";

                  return (
                    <tr key={alumni._id}>
                      {/* Profile Image */}
                      <td>
                        <img
                          src={
                            alumni.userimg && !alumni.userimg.includes("default")
                              ? `/uploads/${alumni.userimg}`
                              : `/uploads/${defaultImg}`
                          }
                          alt={alumni.username}
                          className="profile-img"
                          onClick={() => navigate(`/profile/${alumni._id}`)}
                        />
                      </td>

                      {/* Name */}
                      <td
                        className="name-cell"
                        onClick={() => navigate(`/profile/${alumni._id}`)}
                      >
                        {alumni.username}
                      </td>

                      {/* Role */}
                      <td>
                        <span className="role-badge">{alumni.role}</span>
                      </td>

                      <td>{alumni.batchYear}</td>
                      <td>{alumni.usn}</td>
                      <td>{alumni.email}</td>

                      {/* Connections */}
                      <td>
                        <span className="conn-count">
                          {alumni.connections?.length || 0}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        {isSelf ? (
                          <span className="status-badge none">Myself</span>
                        ) : isConnected ? (
                          <div className="action-wrap">
                            <button disabled>Connected</button>
                            <button
                              className="disconnect-btn"
                              onClick={() => handleDisconnect(alumni._id)}
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : isPending ? (
                          <button disabled>Pending…</button>
                        ) : isRequested ? (
                          <button disabled>Requested</button>
                        ) : (
                          <button
                            className="btn-connect"
                            onClick={() => handleRequest(alumni._id)}
                          >
                            Connect
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${statusLabel}`}>
                          {statusText}
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

export default FindAlumni;
