const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();

/* ================== CREATE UPLOADS FOLDER ================== */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("📁 uploads folder created");
}

/* ================== MIDDLEWARE ================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // ✅ simple and safe

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================== MONGODB ================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ================== IMPORT ROUTES ================== */
const UserRoutes = require("./Routes/UserRoutes");
const AccountRoutes = require("./Routes/AccountRoutes");
const StudentRoutes = require("./Routes/StudentRoutes");
const AlumniRoutes = require("./Routes/AlumniRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const AdminRoutes = require("./Routes/AdminRoutes");
const SearchRoutes = require("./Routes/SearchRoutes");
const ForgotRoutes = require("./Routes/ForgotRoutes");

/* ================== USE ROUTES ================== */
app.use("/api/user", UserRoutes);
app.use("/api/account", AccountRoutes);
app.use("/api/student", StudentRoutes);
app.use("/api/alumni", AlumniRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/search", SearchRoutes);
app.use("/api/auth", ForgotRoutes);

/* ================== TEST ROUTE ================== */
app.get("/api", (req, res) => {
  res.send("✅ KIT Alumni backend is running fine");
});

/* ================== SERVE REACT BUILD ================== */
app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

/* ================== SOCKET ================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ✅ FIXED (no undefined variable)
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("user-online", async (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);

    try {
      const UserModel = require("./Models/UserModel");
      await UserModel.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userStatusUpdate", { userId, isOnline: true });
    } catch (err) {
      console.error("❌ Online status error:", err);
    }
  });

  socket.on("send-message", async ({ fromUserId, toUserId, message }) => {
    try {
      const ChatModel = require("./Models/ChatModel");

      const newChat = await ChatModel.create({
        sender: fromUserId,
        receiver: toUserId,
        message,
      });

      const receiverSocket = onlineUsers.get(toUserId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", { chat: newChat });
      }

      socket.emit("message-sent", { chat: newChat });
    } catch (err) {
      console.error("❌ Message error:", err);
    }
  });

  socket.on("disconnect", async () => {
    let disconnectedUserId = null;

    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      try {
        const UserModel = require("./Models/UserModel");
        await UserModel.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
        });

        io.emit("userStatusUpdate", {
          userId: disconnectedUserId,
          isOnline: false,
        });
      } catch (err) {
        console.error("❌ Offline status error:", err);
      }
    }
  });
});

/* ================== START SERVER ================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});