const mongoose = require("mongoose");
const Usermodel = require("../model/usermodel");
const transporter = require("../config/mail")


exports.connectUser = async (req, res) => {
  try {
    const senderId = req.session.userId;
    let receiverId = req.body.receiverId;

    // Validate sender and receiver IDs
    if (!senderId || !receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).send("Invalid request.");
    }

    console.log("receiverId from body:", receiverId);
    console.log("senderId from session:", senderId);

    receiverId = new mongoose.Types.ObjectId(receiverId);

    const sender = await Usermodel.findById(senderId);
    const receiver = await Usermodel.findById(receiverId);

    // Handle missing users
    if (!sender || !receiver) {
      return res.status(404).send("Sender or Receiver not found.");
    }

    // Prevent sending request to self
    if (sender._id.equals(receiver._id)) {
      return res.status(400).send("You cannot connect with yourself.");
    }

    // Optional: Prevent duplicate connection requests
    if (receiver.pendingRequests.includes(sender._id)) {
      return res.render("alreadysent"); // Add return to prevent further execution
    }

    // Generate accept link
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const acceptLink = `${baseUrl}/accept-request?senderId=${sender._id}&receiverId=${receiver._id}`;

    // Email setup
    const mailOptions = {
      from: sender.email,
      to: receiver.email,
      subject: "New Connection Request",
      html: `
        <p><strong>${sender.username}</strong> wants to connect with you on Answerme.</p>
        <p>Click the button below to accept the request:</p>
        <a href="${acceptLink}" style="display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; border-radius:5px; text-decoration:none;">Accept Request</a>
        <p>If you did not expect this, you can ignore this email.</p>
        <p>Requested user details:</p>
        <p>Username: ${sender.username}</p>
        <p>Email: ${sender.email}</p>
        <p>Branch: ${sender.branch}</p>
        <p>USN: ${sender.usn}</p>
        <p>Admission Year: ${sender.graduate}</p>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.error("Email error:", err);
        return res.status(500).send("Error sending connection email.");
      }

      // Save the pending request
      receiver.pendingRequests.push(sender._id);
      await receiver.save();

      // Redirect with query parameter for success message
      res.redirect(`${req.get("Referer") || "/users"}?requestSuccess=true`);
    });

  } catch (err) {
    console.error("Connect User Error:", err);
    res.status(500).send("Server error.");
  }
}; 

// -----------------this is for accept request---------------------//
exports.acceptRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).send("Invalid request.");
    }

    const sender = await Usermodel.findById(senderId);
    const receiver = await Usermodel.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send("Sender or Receiver not found.");
    }

    // Add each other to connections
    await Usermodel.findByIdAndUpdate(senderId, {
      $addToSet: { connections: receiver._id },
      $inc: { connectionCount: 1 }
    });

    await Usermodel.findByIdAndUpdate(receiverId, {
      $addToSet: { connections: sender._id },
      $inc: { connectionCount: 1 }
    });

    // Prepare the email
    const mailOptions = {
      from: receiver.email,
      to: sender.email,
      subject: "Connection Request Accepted",
      html: `
        <p><strong>${receiver.username}</strong> has accepted your connection request on <strong>AnswerMe</strong>.</p>
        <p>You can now view their profile and connect further.</p>
        <p><strong>Accepted by:</strong></p>
        <ul>
          <li>Username: ${receiver.username}</li>
          <li>Email: ${receiver.email}</li>
          <li>Branch: ${receiver.branch}</li>
          <li>USN: ${receiver.usn}</li>
        </ul>
      `
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending acceptance email:", err);
        // optional: log or notify, but don't block the flow
      }
    });

    res.render("accepted", { message: "Request accepted successfully!" });

  } catch (err) {
    console.error("Accept Request Error:", err);
    res.status(500).send("Server error.");
  }
};
 
// -------------this is for disconnect user---------------//
exports.disconnectUser = async (req, res) => {
  try {
    let { receiverId } = req.body;
    let senderId = req.user?._id || req.session.userId;

    console.log("receiverId from body:", receiverId);
    console.log("senderId from session or req.user:", senderId);

    if (!receiverId || !senderId) {
      return res.status(400).send("Invalid request");
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).send("Invalid user ID(s).");
    }

    // Convert to ObjectId
    receiverId = new mongoose.Types.ObjectId(receiverId);
    senderId = new mongoose.Types.ObjectId(senderId);

    // Remove connections
    await Usermodel.findByIdAndUpdate(senderId, {
      $pull: { connections: receiverId }
    });

    await Usermodel.findByIdAndUpdate(receiverId, {
      $pull: { connections: senderId }
    });

    // Fetch users for email details
    const sender = await Usermodel.findById(senderId);
    const receiver = await Usermodel.findById(receiverId);

    // Prepare mail
    const mailOptions = {
      from: sender.email,
      to: receiver.email,
      subject: "You have been disconnected",
      html: `
        <p><strong>${sender.username}</strong> has disconnected from you on <strong>AnswerMe</strong>.</p>
        <p>This means your profiles are no longer connected.</p>
        <hr>
        <p><strong>Disconnected by:</strong></p>
        <ul>
          <li>Username: ${sender.username}</li>
          <li>Email: ${sender.email}</li>
          <li>USN: ${sender.usn}</li>
          <li>Branch: ${sender.branch}</li>
        </ul>
        <p>If you believe this was a mistake, you may reconnect anytime through the platform.once connection request sent dont need to send request another time.</p>
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email sending error after disconnect:", err);
        // Don't block on mail errors
      }
    });

    res.redirect(req.get("Referrer") || "/");

  } catch (err) {
    console.error("Disconnect Error:", err);
    res.status(500).send("Error disconnecting users");
  }
};
