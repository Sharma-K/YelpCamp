if(process.env.NODE_ENV !== "production")
{
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Joi = require('joi');

// const {campgroundSchema, reviewSchema } = require('./schemas.js');

const userRoutes = require('./routes/users');
const  campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');


const dbUrl = process.env.DB_URL;


const app = express();


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
  console.log('Database connected');
}
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function(e){
    console.log('Session store error', e);
})


const sessionConfig = {
    store,
    name: 'Yelp.sid',
   secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000 * 60 * 60 *24 * 7
    }
    
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // how do we store the user in the session
passport.deserializeUser(User.deserializeUser()) // how to get user out of the data



app.use((req, res, next)=>{
    // console.log(req.query);
    res.locals.currentUser = req.user;
res.locals.success = req.flash('success');
res.locals.error = req.flash('error');
next();
})

app.get('/fakeUser', async(req, res)=>{
    const user = new User({email: 'keshav@gmail.com', username: 'keshav'})
   const newUser = await User.register(user, 'password');
   res.send(newUser);
})

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

// app.use(helmet({ contentSecurityPolicy: false }));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dv5vm4sqh/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/********/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/" ],
            childSrc   : [ "blob:" ]
        }
    })
);



app.get('/', (req, res)=>{
    // res.send('Welcome to Yelp Camp')
    res.render('home');
})




app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


// app.get('/makecampground',async (req, res)=>{
//      Campground.deleteMany({});
//     // await camp.save();
//     // res.send(camp);
// })
const port = process.env.PORT || '3000'
app.listen(port, ()=>{
    console.log(`Serving on port ${port}`);
})