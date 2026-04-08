const express = require("express");
const router = express.Router();
const mealkitUtil = require("../models/mealkit-util");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
const bcryptjs = require("bcryptjs");
const mealkitModel = require("../models/mealkitModel"); 

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

// Setup dotenv
dotenv.config({ path: "./config/.env"});

const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.mailgun.net'
});

// Middleware for authorization
const isCustomer = (req, res, next) => {
    if (req.session.user && req.session.role === "customer") {
        next();
    } else {
        res.status(401).render("error", {
            title: "Access Denied",
            statusCode: 401,
            message: "You are not authorized to view this page"
        });
    }
};

const isClerk = (req, res, next) => {
    if (req.session.user && req.session.role === "clerk") {
        next();
    } else {
        res.status(401).render("error", {
            title: "Access Denied",
            statusCode: 401,
            message: "You are not authorized to view this page"
        });
    }
};

// Home
// Changed home route to display using mongoDB data!
router.get("/", (req, res) => {
    mealkitModel.find({ featuredMealKit: true }).lean()
        .then(featuredMeals => {
           
            res.render("general/home", { 
                title: "Sarap MealKits",
                meals: featuredMeals 
            });
        })
        .catch(err => {
            console.log("Error loading featured meals: " + err);
            res.render("general/home", { title: "Sarap MealKits", meals: [] });
        });
});

// Sign-up (GET & POST)
router.get('/sign-up', (req, res) => {
    res.render("general/sign-up", {
        title: "Sign-Up Page",
        errors: {},
        values:{}
    });
});

router.post('/sign-up', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    let passedValidation = true;
    let errors = {};

    if(!firstName || firstName.trim().length === 0) { errors.firstName = "Please enter your first name."; passedValidation = false; }
    if(!lastName || lastName.trim().length === 0) { errors.lastName = "Please enter your last name."; passedValidation = false; }
    
    const emailRegex = /^[^\.\s][\w\-\.{2,}]+@([\w-]+\.)+[\w-]{2,}$/;
    if(!email || !emailRegex.test(email)){ errors.email = "Please enter a valid email address"; passedValidation = false; }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
    if(!password || !passwordRegex.test(password)){ errors.password = "Please enter a valid password"; passedValidation = false; }

    if (passedValidation) {
        userModel.findOne({ email: email }).then(user => {
            if (user) {
                res.render("general/sign-up", {
                    title: "Sign-Up Page",
                    errors: { email: "That email address is already in use." },
                    values: req.body
                });
            } else {
                const newUser = new userModel({ firstName, lastName, email, password });
                newUser.save().then(savedUser => {
                    mg.messages.create(process.env.MAILGUN_DOMAIN, {
                        from: `Sarap MealKits <postmaster@${process.env.MAILGUN_DOMAIN}>`,
                        to: [email],
                        subject: `Welcome to Sarap MealKits, ${firstName}!`,
                        text: `Hi ${firstName}, Welcome to Sarap MealKits!`
                    }).then(() => res.redirect("/welcome"))
                    .catch(() => res.redirect("/welcome"));
                });
            }
        });
    } else {
        res.render("general/sign-up", { title: "Sign-Up Page", errors: errors, values: req.body });
    }
});

// REMOVED: router.get("/cart") logic - move to cartController.js to make it more organized!

// Clerk Inventory List
router.get("/mealkits/list", isClerk, (req, res) => {
    mealkitModel.find().sort({ title: 1 }).lean()
        .then((mealkitsFromDb) => {
            res.render("mealkits/list", {
                title: "Meal Kit Inventory",
                mealkits: mealkitsFromDb
            });
        })
        .catch(err => res.render("error", { message: "Could not load the list." }));
});

// Log-in (GET & POST)
router.get('/log-in', (req, res) => {
    res.render("general/log-in", { title: "Login Page", errors: {}, values: {} });
});

router.post('/log-in', (req, res) => {
    const { email, password, role } = req.body;
    userModel.findOne({ email: email }).then(user => {
        if(user){
            bcryptjs.compare(password, user.password).then(matching => {
                if(matching){
                    req.session.user = user;
                    req.session.role = role;
                    if(role === "clerk") res.redirect("/mealkits/list");
                    else if(role === "customer") res.redirect("/cart");
                    else res.redirect("/");
                } else {
                    res.render("general/log-in", { title: "Login Page", errors: { password: "Invalid email and/or password." }, values: req.body });
                }
            });
        } else {
            res.render("general/log-in", { title: "Login Page", errors: { password: "Invalid email and/or password." }, values: req.body });
        }
    });
});

// Log-out
router.get("/log-out", (req, res) => {
    req.session.destroy(() => res.redirect("/log-in"));
});

// Welcome
router.get("/welcome", (req, res) => {
    res.render("general/welcome", { title: "Welcome to Sarap MealKits" });
});

module.exports = router;