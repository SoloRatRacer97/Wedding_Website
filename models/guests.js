const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GuestsSchema = new Schema({
  firstName: String,
  lastName: String,
  family: String,
  pending: {type: Boolean, default: true},
  accept: {type: Boolean, default: false},
  decline: {type: Boolean, default: false},
  song_request: {type: String, default: "N/A"}
});

module.exports = mongoose.model("Guests", GuestsSchema);
