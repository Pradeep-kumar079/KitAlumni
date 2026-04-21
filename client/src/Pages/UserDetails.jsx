import React, { useEffect, useState, useCallback, useMemo } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./UserDetails.css";

const socket = io("/", {
  transports: ["websocket"],
  withCredentials: true,
});

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const renderImage = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return path.startsWith("uploads/") ? `/${path}` : `/uploads/${path}`;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const userRes = await API.get(`/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.data.success) {
        const u = userRes.data.user;
        setUser((prev) =>
          JSON.stringify(prev) !== JSON.stringify(u) ? u : prev
        );

        const connRes = await API.get(`/user/connections/${u._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (connRes.data.success) {
          setConnections((prev) =>
            JSON.stringify(prev) !== JSON.stringify(connRes.data.connections)
              ? connRes.data.connections
              : prev
          );
        }

        socket.emit("user-online", u._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();

    socket.on("userStatusUpdate", ({ userId, isOnline }) => {
      setConnections((prev) =>
        prev.map((c) =>
          c._id === userId && c.isOnline !== isOnline ? { ...c, isOnline } : c
        )
      );
    });

    return () => socket.off("userStatusUpdate");
  }, [fetchData]);

  const onlineCount = useMemo(
    () => connections.filter((c) => c.isOnline).length,
    [connections]
  );

  const connectionList = useMemo(() => {
    return connections.map((conn) => {
      const img = renderImage(conn.userimg);
      return (
        <div
          key={conn._id}
          className="ud-connection-card"
          onClick={() => navigate(`/chat/${conn._id}`)}
        >
          <div className="ud-connection-avatar">
            {img ? (
              <img src={img} alt="" className="ud-connection-img" />
            ) : (
              <div className="ud-connection-img ud-fallback">
                {conn.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`ud-status-dot ${conn.isOnline ? "online" : "offline"}`} />
          </div>

          <div className="ud-connection-info">
            <h4>{conn.username}</h4>
            <p>{conn.usn}</p>
          </div>

          {conn.isOnline && (
            <span className="ud-online-label">Online</span>
          )}
        </div>
      );
    });
  }, [connections, navigate, renderImage]);

  if (loading) return <div className="ud-loading">Loading profile…</div>;
  if (!user)   return <div className="ud-empty">No user data found</div>;

  const profileSrc = renderImage(user.userimg);

  return (
    <div className="ud-container">
      {/* ── User Card ── */}
      <div className="ud-card-user">
        {profileSrc ? (
          <img src={profileSrc} alt="" className="ud-user-img" />
        ) : (
          <div className="ud-user-img ud-fallback">
            {user.username?.charAt(0).toUpperCase()}
          </div>
        )}

        <h2 className="ud-user-name">{user.username}</h2>
        <p className="ud-user-email">{user.email}</p>

        <div className="ud-user-meta">
          <span className="ud-meta-pill">{user.usn}</span>
          <span className="ud-meta-pill role">{user.role}</span>
        </div>
      </div>

      {/* ── Connections ── */}
      <div className="ud-connections-box">
        <div className="ud-connections-header">
          <h3 className="ud-connections-title">
            Connections
          </h3>
          {connections.length > 0 && (
            <span className="ud-conn-count">
              {onlineCount} online · {connections.length} total
            </span>
          )}
        </div>

        <div className="ud-connections-grid">
          {connectionList.length > 0 ? (
            connectionList
          ) : (
            <p className="ud-empty">No connections yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserDetails);
