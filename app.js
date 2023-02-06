const express = require("express");
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Guest = require("./models/guests");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const User = require("./models/user");
const { register } = require("./models/user");

const userRoutes = require("./routes/users");
const guestRoutes = require("./routes/guests");

mongoose.connect("mongodb://localhost:27017/weddingAttendees");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// router seems to not like guests.. but it works fine without it??
app.use("/guests", guestRoutes);

const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", async (req, res) => {
  res.render("home");
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "test@test.com", username: "test" });
  const newUser = await User.register(user, "Pa$$w0rd");
  res.send(newUser);
});

app.get("/guests", async (req, res) => {
  const guests = await Guest.find({});
  res.render("guests/index", { guests });
  console.log(guests);
});

app.get("/songs", async (req, res) => {
  const guests = await Guest.find({});
  res.render("guests/songs", { guests });
});

app.get("/guests/new", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("guests/new");
});

app.post("/guests", async (req, res) => {
  const guest = new Guest(req.body.guest);
  await guest.save();
  res.redirect("/guests/new");
});

app.get("/guests/edit", async (req, res) => {
  const guests = await Guest.find({});
  res.render("guests/edit", { guests });
});

app.get("/guests/:id/guest_edit", async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  const guests = await Guest.find({});
  res.render("guests/guest_edit", { guest, guests });
});

app.put("/guests/guest_edit/:id", async (req, res) => {
  const { id } = req.params;
  const guest = await Guest.findById(id);
  await Guest.findByIdAndUpdate(id, { ...req.body.guest });
  res.redirect("/guests/edit");
});

app.post("/guests", async (req, res) => {
  const guest = new Guest(req.body.guest);
  await guest.save();
  res.redirect(`/guests`);
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/guests/:id/decision", async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  const guests = await Guest.find({});
  res.render("guests/decision", { guest, guests });
});

app.put("/guests/:id", async (req, res) => {
  const { id } = req.params;
  const guestId = req.body.guest;
  for (const key of Object.keys(guestId)) {
    var currentId = key;
    const guest = await Guest.findById(currentId);
    var decision = guestId[key];
    if (decision === "accept") {
      guest.accept = true;
      guest.decline = false;
      guest.pending = false;
      await Guest.findByIdAndUpdate(currentId, { ...guest });
    } else if (decision === "decline") {
      guest.decline = true;
      guest.accept = false;
      guest.pending = false;
      await Guest.findByIdAndUpdate(currentId, { ...guest });
    }
  }

  await Guest.findByIdAndUpdate(id, { ...req.body.guest });
  res.redirect(`/guests`);
  // console.log(req.body);
});

app.put("/guests/:id", async (req, res) => {
  const { id } = req.params;
  const guest = await Guest.findById(id);
  await Guest.findByIdAndUpdate(id, { ...req.body.guest });
  res.redirect("/guests/edit");
});

app.delete("/guests/:id", async (req, res) => {
  const { id } = req.params;
  await Guest.findByIdAndDelete(id);
  res.redirect("/guests/edit");
});

app.get("/registry", async (req, res) => {
  res.render("registry");
});

// Bridal party page no longer needed
// app.get("/bridal_party", async (req, res) => {
//   res.render("bridal_party");
// });

app.get("/photos", async (req, res) => {
  res.render("photos");
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    req.flash("success", "welcome back!");
    res.redirect("/");
  }
);

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
