import React from "react";
import Navbar from "./Navbar";
import "./About.css";

import { FaReact, FaNodeJs } from "react-icons/fa";
import { SiMongodb, SiExpress, SiSocketdotio } from "react-icons/si";

const features = [
  {
    icon: "🔐",
    title: "Secure Authentication",
    desc: "JWT-based login with protected routes and session management.",
  },
  {
    icon: "🤝",
    title: "Alumni Connections",
    desc: "Send connection requests, follow peers, and build your network.",
  },
  {
    icon: "❤️",
    title: "Like, Comment & Share",
    desc: "Engage with posts through reactions, threaded comments, and shares.",
  },
  {
    icon: "💬",
    title: "Real-time Chat",
    desc: "Instant messaging powered by Socket.io with online status indicators.",
  },
  {
    icon: "🔍",
    title: "Smart Search",
    desc: "Search across users, posts, and tags with live suggestions.",
  },
];

const stack = [
  { icon: <FaReact color="#61DAFB" />, name: "React.js" },
  { icon: <FaNodeJs color="#68A063" />, name: "Node.js" },
  { icon: <SiExpress color="#999" />, name: "Express.js" },
  { icon: <SiMongodb color="#47A248" />, name: "MongoDB" },
  { icon: <SiSocketdotio />, name: "Socket.io" },
  { icon: "🔑", name: "JWT Auth" },
];

const About = () => {
  return (
    <>
      <Navbar />

      <div className="about-wrapper">

        {/* ── HERO ── */}
        <div className="about-hero">
          <div className="about-badge">Alumni Connect Platform</div>
          <h1 className="about-title">Bridging Students &amp;<br />Alumni, Together</h1>
          <p className="about-desc">
            A modern networking platform designed to foster meaningful connections,
            share opportunities, and build a thriving alumni community.
          </p>
        </div>

        {/* ── TECH STACK ── */}
        <div className="about-section">
          <div className="section-header">
            <div className="section-icon blue">💻</div>
            <h2>Tech Stack</h2>
          </div>
          <div className="stack-grid">
            {stack.map((item, i) => (
              <div className="stack-item" key={i}>
                <span className="stack-icon">{item.icon}</span>
                <span className="stack-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="about-section">
          <div className="section-header">
            <div className="section-icon gold">🚀</div>
            <h2>Key Features</h2>
          </div>
          <ul className="feature-list">
            {features.map((f, i) => (
              <li key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── GOAL ── */}
        <div className="about-section">
          <div className="section-header">
            <div className="section-icon navy">🎯</div>
            <h2>Our Goal</h2>
          </div>
          <p className="goal-text">
            To build a <strong>strong, lasting bridge</strong> between students and alumni —
            a space where knowledge flows freely, career opportunities are shared openly,
            and guidance is always just a message away. We believe every student deserves
            a mentor, and every alumnus deserves a community.
          </p>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Alumni</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">120+</div>
              <div className="stat-label">Colleges</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default About;
