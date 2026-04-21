const bcrypt = require('bcryptjs');
const Usermodel = require("../model/usermodel");
const Tokenmodel = require("../model/Tokenmodel");
const crypto = require("crypto");
const transporter = require("../config/mail");
require("dotenv").config();
const nodemailer = require('nodemailer');  


// ----------------- Render Register Page -------------------- //
exports.getRegisterPage = async (req, res) => {
  try {
    if (req.session.isAuth) {
      return res.redirect("/home");
    }
    const messages = {
      error: req.flash("error"),
      success: req.flash("success"),
    };
    res.render("register", { messages });
  } catch (err) {
    console.error("Error rendering register page:", err);
    res.status(500).send("Server error.");
  }
};
exports.registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      branch,
      usn,
      graduate,
      role,
      mobileno,
      otp,
      dob,
    } = Object.fromEntries(
      Object.entries(req.body).map(([key, val]) => [key, typeof val === 'string' ? val.trim() : val])
    );

    console.log("Received data:", { username, email, password, branch, usn, graduate, role, mobileno, otp });

    if (!username || username.length < 4) {
      req.flash("error", "Username must be at least 4 characters long.");
      return res.redirect("/register");
    }

    if (!password || password.length < 5) {
      req.flash("error", "Password must be at least 5 characters long.");
      return res.redirect("/register");
    }

    if (!email || !usn) {
      req.flash("error", "Email and USN are required.");
      return res.redirect("/register");
    }

    // ✅ OTP and Email Check
    if (!otp || otp !== req.session.otp?.toString() || email !== req.session.emailForOtp) {
      console.log("Invalid OTP or email mismatch");
      req.flash("error", "Invalid OTP or email verification failed.");
      return res.redirect("/register");
    }

    // ⏰ Optional: Expiry check
    const now = Date.now();
    if (req.session.otpGeneratedAt && (now - req.session.otpGeneratedAt > 5 * 60 * 1000)) {
      req.flash("error", "OTP has expired. Please request a new one.");
      return res.redirect("/register");
    }

    const existingUser = await Usermodel.findOne({
      $or: [
        { usn: new RegExp(`^${usn}$`, "i") },
        { email: new RegExp(`^${email}$`, "i") },
      ],
    });

    if (existingUser) {
      req.flash("error", "User already exists with this email or USN.");
      return res.redirect("/register");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.session.sessionid = req.sessionID;

    const newUser = new Usermodel({
      username,
      email,
      password: hashedPassword,
      branch,
      usn,
      graduate,
      role,
      mobileno,
      otp,
      dob: new Date(dob),
      sessionid: req.session.sessionid,
    });

    await newUser.save();
    console.log("Successfully registered:", newUser);

    // ✅ Clear OTP session data after successful registration
    delete req.session.otp;
    delete req.session.emailForOtp;
    delete req.session.otpGeneratedAt;

    req.session.userId = newUser._id;
    req.session.isAuth = true;

    req.flash("success", "Registration successful! You can now log in.");
    return res.redirect("/home");

  } catch (err) {
    console.error("Error during registration:", err);
    req.flash("error", "Something went wrong! Please try again.");
    res.redirect("/register");
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  // ✅ Save OTP and email for later verification
  req.session.otp = otp;
  req.session.emailForOtp = email; // ✅ FIXED NAME
  req.session.otpGeneratedAt = Date.now(); // Optional: timestamp for expiry

  console.log("OTP sent:", otp); // For dev testing

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// ----------------- Render Login Page -------------------- //
exports.getLoginPage = (req, res) => {
  if (req.session.isAuth) {
    return res.redirect("/home");
    
  }
  const messages = {
    error: req.flash("error"),
    success: req.flash("success")
  };
  res.render("login",{messages});
};
exports.loginUser = async (req, res) => {
  try {
    const { usn, password } = req.body;
    console.log("USN:", usn);

    const existUser = await Usermodel.findOne({ usn });

    if (!existUser) {
      console.log("User not found for USN:", usn);
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, existUser.password);
    if (!isMatch) {
      console.log("Incorrect password for:", usn);
      req.flash("error", "Incorrect password");
      return res.redirect("/login");
    }

    req.session.isAuth = true;
    req.session.userId = existUser._id;
    req.session.userEmail = existUser.email;
    req.session.userRole = existUser.role;

    console.log("User logged in:", existUser.usn, "| Role:", existUser.role);

    if (existUser.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    res.redirect("/home");
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logoutUser = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Failed to log out. Please try again.");
      }
      res.clearCookie("connect.sid");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "-1");
      res.redirect("/lgtmsg");
    });
  } catch (err) {
    console.error("Error in logout route:", err);
    res.status(500).send("Server error.");
  }
};

exports.renderLogoutGreeting = (req, res) => {
  req.session.isAuth = false;
  res.render("logoutgreet");
};

exports.renderForgotPassword = (req, res) => {
  res.render("forgotpass");
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Usermodel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User with this email does not exist." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await Tokenmodel.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 3600000,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.render("gmailsent");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.renderResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Received Token from URL:", token);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tokenRecord = await Tokenmodel.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!tokenRecord) {
      console.log("Token not found or expired.");
      return res.status(400).send("Invalid or expired token.");
    }

    res.render("resetpass", { resetToken: token });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).send("Server error.");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tokenRecord = await Tokenmodel.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!tokenRecord) return res.status(400).send("Invalid or expired token.");

    const user = await Usermodel.findById(tokenRecord.userId);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Tokenmodel.deleteOne({ _id: tokenRecord._id });

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
};

