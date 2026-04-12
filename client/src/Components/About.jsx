import React from "react";
import Navbar from "./Navbar";
import "./About.css";

// ICONS
import { FaReact, FaNodeJs, FaDatabase } from "react-icons/fa";
import { SiMongodb, SiExpress, SiSocketdotio } from "react-icons/si";
import { MdSecurity, MdOutlineConnectWithoutContact } from "react-icons/md";
import { AiOutlineLike } from "react-icons/ai";
import { FaComments, FaSearch } from "react-icons/fa";

const About = () => {
  return (
    <>
      <Navbar />

      <div className="about-wrapper">

        <h1 className="about-title">About This Project</h1>

        <p className="about-desc">
          This platform is a modern Alumni Networking System designed to connect
          students and alumni, enabling them to share knowledge, opportunities,
          and build meaningful connections.
        </p>

        {/* STACK */}
        <div className="about-section">
          <h2>💻 Tech Stack</h2>

          <div className="stack-grid">
            <div><FaReact /> React.js</div>
            <div><FaNodeJs /> Node.js</div>
            <div><SiExpress /> Express.js</div>
            <div><SiMongodb /> MongoDB</div>
            <div><FaDatabase /> Database</div>
            <div><SiSocketdotio /> Socket.io</div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="about-section">
          <h2>🚀 Key Features</h2>

          <ul className="feature-list">
            <li><MdSecurity /> Secure Authentication (JWT)</li>
            <li><MdOutlineConnectWithoutContact /> Alumni Connections</li>
            <li><AiOutlineLike /> Like, Comment & Share Posts</li>
            <li><FaComments /> Real-time Chat</li>
            <li><FaSearch /> Smart Search (Users & Posts)</li>
          </ul>
        </div>

        {/* GOAL */}
        <div className="about-section">
          <h2>🎯 Our Goal</h2>
          <p>
            To build a strong bridge between students and alumni where knowledge,
            career opportunities, and guidance are shared seamlessly.
          </p>
        </div>

      </div>
    </>
  );
};

export default About;