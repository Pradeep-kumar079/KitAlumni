import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Students.css";

const Students = () => {
  const [batches, setBatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
          const formatted = Object.keys(grouped)
            .sort((a, b) => b - a)
            .map((year) => ({
              batchYear: year,
              students: grouped[year],
              count: grouped[year].length,
            }));
          setBatches(formatted);
          setFiltered(formatted);
        }
      } catch (err) {
        console.error("Error fetching student batches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentBatches();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      setFiltered(batches);
    } else {
      setFiltered(batches.filter((b) => b.batchYear.includes(val.trim())));
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="batch-loading">
          <div className="batch-spinner" />
          Loading batches…
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="batch-page">
        <div className="batch-inner">

          {/* ── HERO ── */}
          <div className="batch-hero">
            <div className="hero-icon-wrap">🎒</div>
            <div className="hero-text">
              <div className="hero-eyebrow">Alumni Connect</div>
              <h1>Find Students by Batch</h1>
              <p>Browse all enrolled students organised by their admission year.</p>
            </div>
          </div>

          {/* ── TOOLBAR ── */}
          <div className="batch-toolbar">
            <div className="batch-search-wrap">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="batch-search"
                placeholder="Search by year, e.g. 2022…"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div className="batch-count-badge">
              <strong>{filtered.length}</strong> batch{filtered.length !== 1 ? "es" : ""} found
            </div>
          </div>

          {/* ── GRID ── */}
          {filtered.length === 0 ? (
            <div className="batch-empty">
              <div className="batch-empty-icon">📭</div>
              <h3>No batches found</h3>
              <p>Try a different year or check back later.</p>
            </div>
          ) : (
            <div className="allbatchs">
              {filtered.map((b, i) => (
                <div
                  key={i}
                  className="batch-box"
                  onClick={() => navigate(`/findstudent/${b.batchYear}`)}
                >
                  <div className="batch-card-top">
                    <svg className="batch-arrow" viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                    <div className="batch-year-text">{b.batchYear}</div>
                    <div className="batch-label">Admission Year</div>
                  </div>
                  <div className="batch-card-bottom">
                    <span className="batch-member-count">
                      {b.count} student{b.count !== 1 ? "s" : ""}
                    </span>
                    <span className="batch-chip">View</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Students;
