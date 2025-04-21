const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Usermodel = require('../model/usermodel');
const member = require("../model/member");
const multer = require('multer');
const upload = require('../utils/upload');
// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect('/login');
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.session.userRole === 'admin') return next();
  res.status(403).send('Access denied: Admins only');
};

// Optional: Direct dashboard route (for testing or override)
router.get('/admin/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  const users = await Usermodel.find();
  res.render('admin/dashboard', { users });
});

// Admin Routes
router.get('/dashboard', isAuthenticated, isAdmin, adminController.getDashboard);
router.get('/user/edit/:id', isAuthenticated, isAdmin, adminController.editUserForm);
router.post('/user/edit/:id', isAuthenticated, isAdmin, adminController.updateUser);
router.post('/user/delete/:id', isAuthenticated, isAdmin, adminController.deleteUser);

// //upload placement
// router.get('/placement', isAuthenticated, isAdmin,adminController.getuploadplacement);
// router.post('/placement', isAuthenticated, isAdmin, adminController.postuploadPlacement);

// Route to render the edit form
router.get('/edit-event/:id', adminController.getEditEvent);

// Route to handle update (if needed)
router.post('/edit-event/:id', adminController.postEditEvent);

router.post('/delete-event/:id', adminController.deleteEvent);

router.post('/delete-placement/:id', adminController.deletePlacement);

router.get('/add-member', (req, res) => {
  res.render('addmembers'); // Create this EJS file
});

// Handle form submission (POST)

router.post('/add-member', upload.single('profileimg'), async (req, res) => {
  const { username, role, about } = req.body;
  const profileimg = req.file ? req.file.filename : null;

  try {
    const newMember = new member({ username, role, about, profileimg });
    await newMember.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).send('Error adding member: ' + err.message);
  }
});
// Edit Member Route
router.get('/add-member/:id/edit', async (req, res) => {
  try {
    const memberData = await member.findById(req.params.id);
    if (!memberData) {
      return res.status(404).send('Member not found');
    }
    res.render('editmember', { member: memberData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.post('/add-member/:id/edit', upload.single('profileimg'), async (req, res) => {
  try {
    const { username, role, about } = req.body;
    const updateData = { username, role, about };

    if (req.file) {
      updateData.profileimg = req.file.filename;
    }

    await member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE MEMBER
router.post('/add-member/:id/delete', async (req, res) => {
  try {
    await member.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard'); // or wherever you want to go after deletion
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
