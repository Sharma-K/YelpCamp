const mongoose = require('mongoose');
const Campground = require('../models/campground');
// const app = express();
const cities = require('./cities');
const {places, descriptors} = require('./seedsHelper');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log('Database connected');
}

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() =>{
  await Campground.deleteMany({});
  // const c = new Campground({title: 'purple field'});
  // await c.save();

  for(let i=0; i<300; i++)
  {
  const price = Math.floor(Math.random()*20)+10;
    const random1000 = Math.floor(Math.random()*1000);
   const camp = new Campground({
      author: '62ed406a8c4e18399d4fe4bf',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)}, ${sample(places)}`,
      // image: 'https://source.unsplash.com/collection/483251',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo aperiam a cumque! Voluptate sit exercitationem architecto, quibusdam minus vero nulla, facilis vel doloribus velit quidem. Eveniet nisi atque blanditiis aut?',
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dfdtm0lya/image/upload/v1659856525/YelpCamp/h0aggrqupxmbqyqfugnc.jpg',
          filename: 'YelpCamp/h0aggrqupxmbqyqfugnc',
          
        },
        {
          url: 'https://res.cloudinary.com/dfdtm0lya/image/upload/v1659856527/YelpCamp/lssvrdaeuze2cfjs05ly.jpg',
          filename: 'YelpCamp/lssvrdaeuze2cfjs05ly',
          // _id: new ObjectId("62ef66902aa2370df9765b86")
        },
        {
          url: 'https://res.cloudinary.com/dfdtm0lya/image/upload/v1659856528/YelpCamp/dddzj1p24hhwlbuovcan.jpg',
          filename: 'YelpCamp/dddzj1p24hhwlbuovcan',
          // _id: new ObjectId("62ef66902aa2370df9765b87")
        },
        {
          url: 'https://res.cloudinary.com/dfdtm0lya/image/upload/v1659856528/YelpCamp/a12ehy3kk57rlvwomgzn.jpg',
          filename: 'YelpCamp/a12ehy3kk57rlvwomgzn',
          // _id: new ObjectId("62ef66902aa2370df9765b88")
        }
      ]
    })
    await camp.save();
  }
}
seedDB().then(()=>{
  mongoose.connection.close();
});