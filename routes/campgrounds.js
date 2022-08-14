const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchSync');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');

const { storage } = require('../cloudinary');
const upload = multer({storage});


router.route('/')
.get(catchAsync(campgrounds.index))
// .post(upload.array('image'),(req, res)=>{
//       console.log(req.body, req.files);
//       res.send('It worked!');
// })
.post(isLoggedIn,upload.array('image'),validateCampground, catchAsync(campgrounds.createNewCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
      .get(catchAsync(campgrounds.showCampground))
      .put(isLoggedIn,isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
      .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));






router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;