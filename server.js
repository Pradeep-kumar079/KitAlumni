const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const ChatModel = require("./Models/ChatModel");
const UserModel = require("./Models/UserModel");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://kitalumni-frontend.onrender.com",
  "https://kitalumni-backend.onrender.com", // your Render domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Routes
const UserRoutes = require("./Routes/UserRoutes");
const AccountRoutes = require("./Routes/AccountRoutes");
const StudentRoutes = require("./Routes/StudentRoutes");
const AlumniRoutes = require("./Routes/AlumniRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const AdminRoutes = require("./Routes/AdminRoutes");
const SearchRoutes = require("./Routes/SearchRoutes");
const ForgotRoutes = require("./Routes/ForgotRoutes");

app.use("/api/user", UserRoutes);
app.use("/api/account", AccountRoutes);
app.use("/api/student", StudentRoutes);
app.use("/api/alumni", AlumniRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/search", SearchRoutes);
app.use("/api/auth", ForgotRoutes);

// ✅ API Root Test
app.get("/api", (req, res) => {
  res.send("✅ KIT Alumni backend is running fine");
});

/* ✅ Serve React frontend in production */
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Serve static files
  app.use(express.static(path.join(__dirname1, "client", "build")));

  // ✅ Express v5 catch-all route fix
  app.use((req, res, next) => {
    res.sendFile(path.join(__dirname1, "client", "build", "index.html"));
  });
}

// ✅ Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("user-online", async (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    try {
      await UserModel.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userStatusUpdate", { userId, isOnline: true });
    } catch (err) {
      console.error("Error updating online status:", err);
    }
  });

  socket.on("send-message", async ({ fromUserId, toUserId, message }) => {
    try {
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
      console.error("Message error:", err);
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
        await UserModel.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
        io.emit("userStatusUpdate", { userId: disconnectedUserId, isOnline: false });
      } catch (err) {
        console.error("Error updating offline status:", err);
      }
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
