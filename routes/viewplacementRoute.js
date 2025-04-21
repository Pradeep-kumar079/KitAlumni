const express = require('express');
const router = express.Router();
const Event = require('../model/eventSchema');
const Usermodel = require('../model/usermodel');
const Postmodel = require('../model/postmodel');
const Placement = require('../model/placementmodel');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });

router.get('/viewplacement', async (req, res) => {
  try {
    const placements = await Placement.find();
    console.log(placements);
    res.render('placement', { placements });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;