//list of 1000 cities : https://github.com/Colt/YelpCamp/blob/c12b6ca9576b48b579bc304f701ebb71d6f9879a/seeds/cities.js;//
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers");
const mongoose = require("mongoose");
const {randomValueFromArray, randomFromCount} = require("../utilities/utility");

//Initiating db model
const Campground = require("../models/campground");

//Initiating db connection
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Mongo Connected!");
  })
  .catch((error) => {
    console.log("Mongo Connection Error ", error);
  });

//initiating db
const db = mongoose.connection;
db.on("error", console.log.bind(console, "db connection error:"));
db.once("open", () => {
  console.log("db connected");
});

const seedDb = async () => {
  //delete all from db
  await Campground.deleteMany({});

  //picking up random 50 cities from the list
  for (let i = 0; i < 50; i++) {
    const camps = new Campground({
      title: `${randomValueFromArray(descriptors)} ${randomValueFromArray(places)}`,
      price: randomFromCount(20000),
      author: '654bc6aaa909825cec01f7e5',
      image: 'https://source.unsplash.com/collection/429524',
      location: `${cities[randomFromCount(1000)].city}, ${cities[randomFromCount(1000)].state}`,
      description: `${cities[randomFromCount(1000)].latitude} ${cities[randomFromCount(1000)].longitude}`,
    });
    await camps.save();
  }
};

seedDb().then(() => {
    //closing db connection vvimp
    mongoose.connection.close()
});
