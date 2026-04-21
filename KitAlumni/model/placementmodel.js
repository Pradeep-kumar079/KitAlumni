const mongoose = require("mongoose");

const placementInformationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  package: {
    type: String,
    required: true,
  },
  placedStudents: [
    {
      name: String,
      rollNo: String,
      branch: String,
      
    },
  ],
  placementDate: {
    type: Date,
    default:Date.now()
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image:{
    type: String,
    required: false,
  },
  video:{
    type: String,
    required: false,
  },
  description:{
    type:String,
    required:true
  }

},{ timestamps: true });

module.exports = mongoose.model("PlacementInformation", placementInformationSchema);
