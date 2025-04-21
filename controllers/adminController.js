const Usermodel = require('../model/usermodel');
const Event = require('../model/eventSchema'); 
const PlacementModel = require("../model/placementmodel");
const member = require("../model/member");


exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await Usermodel.countDocuments();
    const activeUsers = await Usermodel.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    });
    const currentuser = await Usermodel.findById(req.session.userId);

    const allevents = await Event.find();
    const placement = await PlacementModel.find();
    const members = await member.find();

    res.render('admin/dashboard', {
      totalUsers,
      activeUsers,
      allevents,
      currentuser,
      placement,
      members
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


exports.editUserForm = async (req, res) => {
  try {
    const user = await Usermodel.findById(req.params.id);
    res.render('admin/editusermodel', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('User not found');
  }
};

exports.updateUser = async (req, res) => {
  try {
    await Usermodel.findByIdAndUpdate(req.params.id, {
      role: req.body.role
    });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Update failed');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await Usermodel.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
};

exports.getuploadplacement = (req, res) => {

  res.render('uploadplacement');
};
exports.postuploadPlacement = async (req, res) => {
  try {
    const { title, description, companyName, package } = req.body;
    const placementData = {
      title,
      description,
      companyName,
      package
    };

    // Save placement data to database (assuming you have a Placement model)
    await placements.create(placementData);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Placement upload failed');
  }
};

exports.getEditEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send('Placement not found');
    }

    res.render('edit-event', { event }); // Make sure this EJS file exists
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.postEditEvent = async (req, res) => {
  try {
    const { title, description, location, eventDate, eventTime } = req.body;

    await Event.findByIdAndUpdate(req.params.id, {
      title,
      description,
      location,
      eventDate,
      eventTime,
    });

    res.redirect('/admin/dashboard'); // or wherever you list events
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    res.redirect('/admin/dashboard'); // or wherever your dashboard view is
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).send('Server Error');
  }
};

exports.deletePlacement = async (req, res) => {
  try {
    const placementId  = req.params.id;
    const deleted = await PlacementModel.findByIdAndDelete(placementId);

    if (!deleted) {
      return res.status(404).send('Placement not found');
    }

    res.redirect('/admin/dashboard'); // Or your placements page
  } catch (error) {
    console.error('Error deleting placement:', error);
    res.status(500).send('Server Error');
  }
};



