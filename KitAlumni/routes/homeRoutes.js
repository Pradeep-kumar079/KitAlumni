// routes/homeRoutes.js
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const isAuth = require("../middleware/isAuth");
const Member = require("../model/member"); 
const Feedback = require('../model/feedbackmodel'); 



// Route: /home/
router.get("/home", isAuth, homeController.getHomePage);

// Route: /home/search?q=

router.get('/search-json', isAuth, homeController.searchUsersAndPostsJSON);



router.get('/about', isAuth, async (req, res) => {
  try {
    const members = await Member.find(); // Fetch members from DB
    res.render('aboutpage', { 
      user: req.user,
      members              // Pass members to EJS
    });
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).send("Server Error");
  }
});


const getConnectedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id).populate('connections');
    res.render('home', { connectedUsers: currentUser.connections });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


router.get('/feedback', (req, res) => {
  res.render('home'); // Make sure feedback.ejs is in views/
});

// Handle form submission
router.post('/feedback', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newFeedback = new Feedback({
      name,
      email,
      message
    });
console.log(req.body);
    await newFeedback.save();

    req.flash('success', 'Feedback submitted successfully!');
    res.redirect('/home');
  } catch (err) {
    console.error("Feedback error:", err);
    req.flash('error', 'Something went wrong while submitting feedback.');
    res.redirect('/home');
  }
});


module.exports = router;
