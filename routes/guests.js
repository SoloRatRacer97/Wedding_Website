const express = require("express");
const router = express.Router();
var Guest = require("../models/guests");


router.get("/", async (req, res) => {
  var noMatch = null;
  const guests = await Guest.find({});
  if (req.query.search1) {
    const regex1 = new RegExp(escapeRegex(req.query.search1), "gi");
    Guest.find({ firstName: regex1 }, function (err, guests) {
      if (err) {
        console.log(err);
      } else {
        res.render("guests/index", { guests });
      }
    });
  } 
  else if (req.query.search2) {
    const regex2 = new RegExp(escapeRegex(req.query.search2), "gi");
    Guest.find({ lastName: regex2 }, function (err, guests) {
      if (err) {
        console.log(err);
      } else {
        res.render("guests/index", { guests, noMatch: noMatch });
      }
    });
  }
  else {

    Guest.find({}, function (err, guests) {
      if (err) {
        console.log(err);
      } else {
        res.render("guests/index", { guests: guests, noMatch: noMatch });
      }
    });
  }
});



function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
