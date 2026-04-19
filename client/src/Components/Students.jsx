import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Students.css";

const Students = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchStudentBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await API.get(`/student/all-students`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.students)) {
          const grouped = {};
          res.data.students.forEach((s) => {
            const year = s.admissionyear;
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(s);
          });
          const formatted = Object.keys(grouped).map((year) => ({
            batchYear: year,
            students: grouped[year],
          }));
          setBatches(formatted);
        }
      } catch (err) {
        console.error("❌ Error fetching batches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentBatches();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="batch-container">
      <Navbar />
      <h2 className="mainheading" id="mainheading">Find Students by Batch Year :</h2>
      {batches.length === 0 ? (
        <p>No batches found.</p>
      ) : (
        <div className="allbatchs">
          {batches.map((b, i) => (
            <div key={i} className="batch-box" onClick={() => navigate(`/findstudent/${b.batchYear}`)}>
              <h3>{b.batchYear}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
