import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Post from "./Components/Post";
import About from "./Components/About";
import Students from "./Components/Students";
import FindStudent from "./Components/FindStudent";
import Account from "./Components/Account";
import AcceptRequest from "./Components/AcceptRequest";
import SinglePost from "./Components/SinglePost";
import Profile from "./Components/Profile";
import Alumni from "./Components/Alumni";
import FindAlumni from "./Components/FindAlumni";
import ChatWrapper from "./Components/ChatWrapper";
import Admin from "./Pages/Admin";
import UserDetails from "./Pages/UserDetails";
import ChatPage from "./Pages/ChatPage";
import AcceptSuccess from "./Components/AcceptSuccess";
import AcceptFailed from "./Components/AcceptFailed";
import Gallary from "./Components/Gallary";
import SingleGallery from "./Components/SingleGallery";
import ForgotPass from "./Pages/ForgotPass";
import ResetPass from "./Pages/ResetPass";

const App = () => {
  const [refreshFlag, setRefreshFlag] = React.useState(false);
  const refreshStudents = () => setRefreshFlag((prev) => !prev);

  const isAuth = localStorage.getItem("token");

  return (
    <Router>
      <Routes>

        {/* ROOT */}
        <Route path="/" element={<Navigate to={isAuth ? "/home" : "/login"} />} />

        {/* AUTH */}
        <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/home" />} />
        <Route path="/register" element={!isAuth ? <Register /> : <Navigate to="/home" />} />

        {/* PROTECTED */}
        <Route path="/home" element={isAuth ? <Home /> : <Navigate to="/login" />} />
        <Route path="/post" element={isAuth ? <Post /> : <Navigate to="/login" />} />
        <Route path="/about" element={isAuth ? <About /> : <Navigate to="/login" />} />
        <Route path="/students" element={isAuth ? <Students /> : <Navigate to="/login" />} />

        <Route
          path="/findstudent/:admissionyear"
          element={isAuth ? <FindStudent key={refreshFlag} /> : <Navigate to="/login" />}
        />

        <Route path="/alumni" element={isAuth ? <Alumni /> : <Navigate to="/login" />} />

        <Route
          path="/findalumni/:admissionyear"
          element={isAuth ? <FindAlumni key={refreshFlag} /> : <Navigate to="/login" />}
        />

        <Route
          path="/student/accept-request/:token"
          element={<AcceptRequest refreshStudents={refreshStudents} />}
        />

        <Route path="/account" element={isAuth ? <Account /> : <Navigate to="/login" />} />
        <Route path="/post/:id" element={isAuth ? <SinglePost /> : <Navigate to="/login" />} />
        <Route path="/profile/:userId" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/chat/:otherUserId" element={isAuth ? <ChatWrapper /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuth ? <ChatPage /> : <Navigate to="/login" />} />

        <Route path="/admin" element={isAuth ? <Admin /> : <Navigate to="/login" />} />
        <Route path="/user/:id" element={isAuth ? <UserDetails /> : <Navigate to="/login" />} />

        <Route path="/gallery" element={isAuth ? <Gallary /> : <Navigate to="/login" />} />
        <Route path="/gallery/:id" element={isAuth ? <SingleGallery /> : <Navigate to="/login" />} />

        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/auth/reset-password/:token" element={<ResetPass />} />

      </Routes>
    </Router>
  );
};

export default App;