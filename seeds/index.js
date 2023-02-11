// This file is just to seed the database and will be ran standalone

const { fName, lName, family } = require("./seedHelpers");

const mongoose = require("mongoose");
const Guests = require("../models/guests");
const dotenv = require('dotenv').config();
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/weddingAttendees";

//WeddingAttendee
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDb = async () => {
  await Guests.deleteMany({});
  for (let i = 0; i < fName.length; i++) {
    const person = new Guests({
      firstName: `${fName[i]}`,
      lastName: `${lName[i]}`,
      family: `${family[i]}`,
      song_request: 'N/A'
    });
    await person.save();
  }
};

seedDb().then(() => {
      mongoose.connection.close()
})
