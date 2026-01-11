const express = require("express");
const router = express.Router();
const {
  ChatPostController,
  GetChatController,
  GetReceiverController,
  EditChatController,
  DeleteChatController,
} = require("../Controllers/chatController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/receiver/:receiverId", verifyToken, GetReceiverController);
router.post("/send", verifyToken, ChatPostController);
router.get("/:senderId/:receiverId", verifyToken, GetChatController);
router.put("/edit/:chatId", verifyToken, EditChatController);
router.delete("/delete/:chatId/:userId", verifyToken, DeleteChatController);

module.exports = router;
