import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const AcceptRequest = ({ refreshStudents }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  

  useEffect(() => {
    const acceptConnection = async () => {
      try {
        const res = await API.get(`/student/accept-request/${token}`);
        if (res.data.success) {
          refreshStudents?.();
          navigate("/student/accept-success");
        } else {
          navigate("/student/accept-failed");
        }
      } catch (err) {
        console.error("❌ Error accepting connection:", err);
        navigate("/student/accept-failed");
      }
    };
    acceptConnection();
  }, [token, navigate, refreshStudents]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Processing your request...</h2>
      <p>Please wait while we connect you both.</p>
    </div>
  );
};

export default AcceptRequest;
