var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    User = require("./models/user");
bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

//Db setup
mongoose.connect("mongodb://localhost/auth_demo_app", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

var app = express();
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "this is the secrect",
    resave: false,
    saveUninitialized: false
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

//==============
//All routes 
//==============

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/secret", isLoggedIn,function (req, res) {
    res.render("secret");
});

app.listen(3000, function () {
    console.log("Server started");
})

//==============
// Auth Routes
//==============

//user sign up
app.get("/register", function (req, res) {
    res.render("register");
});

//handle sign up
app.post("/register", function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.render("secret");
            });
        }
    });
});

//login routes
app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function (req, res) {

});

//logout routes
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}