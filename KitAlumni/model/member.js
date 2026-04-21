const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  role: String,
  profileimg: String, // ✅ Only keep this one
  about: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Member', memberSchema);
