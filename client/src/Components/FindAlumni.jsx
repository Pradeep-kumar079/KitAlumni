import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FindStudent.css";

const FindAlumni = () => {
  const { admissionyear } = useParams();
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const defaultImg = "default.jpg"; // ✅ FIXED

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Decode token
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload._id || payload.userId);

        const res = await axios.get(`/api/alumni/all-alumni`, {
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

  // ================= SEND REQUEST =================
  const handleRequest = async (to) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/alumni/send-request`,
        { to },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ UPDATE UI (IMPORTANT)
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
      console.error("❌ Request error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  // ================= DISCONNECT =================
  const handleDisconnect = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/alumni/disconnect`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ UPDATE UI
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
      console.error("❌ Disconnect error:", err.response?.data || err);
      alert("Failed to disconnect.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!alumniList.length)
    return (
      <div className="no-batch">
        No alumni found for batch {admissionyear}
      </div>
    );

  // ================= GROUP BY BRANCH =================
  const groupedByBranch = alumniList.reduce((acc, a) => {
    if (!acc[a.branch]) acc[a.branch] = [];
    acc[a.branch].push(a);
    return acc;
  }, {});

  return (
    <div className="batch-container">
      <h2 id="mainheading">Alumni in {admissionyear}</h2>

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
                {list.map((alumni) => (
                  <tr key={alumni._id}>
                    {/* PROFILE IMAGE */}
                    <td>
                      <img
                        src={
                          alumni.userimg &&
                          !alumni.userimg.includes("default")
                            ? `/uploads/${alumni.userimg}`
                            : `/uploads/${defaultImg}`
                        }
                        alt={alumni.username}
                        className="profile-img"
                        onClick={() => navigate(`/profile/${alumni._id}`)}
                      />
                    </td>

                    <td>{alumni.username}</td>
                    <td>{alumni.role}</td>
                    <td>{alumni.batchYear}</td>
                    <td>{alumni.usn}</td>
                    <td>{alumni.email}</td>
                    <td>{alumni.connections?.length || 0}</td>

                    {/* ACTION */}
                    <td>
                      {currentUserId === alumni._id ? (
                        "Myself"
                      ) : alumni.connections?.includes(currentUserId) ? (
                        <>
                          <button disabled>Connected</button>
                          <button
                            onClick={() => handleDisconnect(alumni._id)}
                            className="disconnect-btn"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : alumni.receivedRequests?.includes(currentUserId) ? (
                        <button disabled>Pending</button>
                      ) : alumni.sentRequests?.includes(currentUserId) ? (
                        <button disabled>Requested</button>
                      ) : (
                        <button onClick={() => handleRequest(alumni._id)}>
                          Connect
                        </button>
                      )}
                    </td>

                    {/* STATUS */}
                    <td>
                      {alumni.connections?.includes(currentUserId)
                        ? "Connected"
                        : alumni.receivedRequests?.includes(currentUserId)
                        ? "Pending"
                        : alumni.sentRequests?.includes(currentUserId)
                        ? "Requested"
                        : "Not Connected"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FindAlumni;