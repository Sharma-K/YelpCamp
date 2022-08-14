const Campground = require('../models/campground');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

const { cloudinary } = require('../cloudinary');
module.exports.index = async (req, res)=>{
    // res.send('Welcome to Yelp Camp')
    // res.render('home');
    const campgrounds = await Campground.find({});

     res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm = (req, res)=>{

    // if(!req.isAuthenticated()){
    //     req.flash('error', 'You must signed in!');
    //     return res.redirect('/login');
    // }
    res.render('campgrounds/new');
}

module.exports.createNewCampground = async(req, res, next)=>{

    //    res.send(req.body)
    // if(!req.body.Campground) throw new ExpressError('Invalid Campground', 400);

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
    
    }

module.exports.showCampground = async(req, res)=>{
    const campground = await Campground.findById(req.params.id).populate(
        {
            path:'reviews',
           populate: {
            path: 'author'
           }
        }
        ).populate('author');
    // console.log(campground);
    if(!campground)
    {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground)
    {
        req.flash('error', 'Cannot find that campground!');
    }
   
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground =async(req, res)=>{
    //  res.send("It worked");

    const { id } = req.params;
    // const campground = await Campground.findById(id);
   
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const img = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...img);
    await campground.save();
    if(req.body.deleteImages)
    {
        for(let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
      await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    //   console.log(campground);
    }

    req.flash('success', 'Successfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
};