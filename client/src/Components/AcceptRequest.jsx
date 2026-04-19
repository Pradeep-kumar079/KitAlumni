import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

const AcceptRequest = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const acceptRequest = async () => {
      try {
        const res = await API.get(`/student/accept-request/${token}`);

        if (res.data.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Accept request error:", err);
        setStatus("error");
      }
    };

    acceptRequest();
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {status === "loading" && <h2>⏳ Processing request...</h2>}

      {status === "success" && (
        <>
          <h2 style={{ color: "green" }}>✅ Connection Accepted!</h2>
          <p>You are now connected 🎉</p>
        </>
      )}

      {status === "error" && (
        <>
          <h2 style={{ color: "red" }}>❌ Invalid or Expired Link</h2>
        </>
      )}
    </div>
  );
};

export default AcceptRequest;