/*************************************************************************************
* WEB322 - 2261 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Luke Olsen Tristan Ramos
* Student ID    : 143552222
* Student Email : lotramos@myseneca.ca
* Course/Section: WEB322/NCC
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const fileUpload = require("express-fileupload");

// add middlewear for public
app.use(express.static('public'));
const expressLayouts = require("express-ejs-layouts");

// Setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set('views', path.join(__dirname, 'views'));

//Setup a static folder
app.use(express.static(path.join(__dirname, "public")));

// Set up body-parser
app.use(express.urlencoded({ extended: false }));

// Set-up express-fileUpload
app.use(fileUpload());

// Setup dotenv to protect the environment variables
dotenv.config({ path: "./config/.env"});

// Setup Express-Session with session password
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.role = req.session.role;
    next();
});

// Add your routes here
// e.g. app.get() { ... }

// --- MVC Controllers ---
const generalController = require("./controllers/generalController");
const mealkitsController = require("./controllers/mealkitsController");
const loadDataController = require("./controllers/loadDataController");
const cartController = require("./controllers/cartController");

app.use("/cart", cartController);
app.use("/load-data", loadDataController);
app.use("/mealkits", mealkitsController);

app.use("/", generalController);

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).render("error",{
        title: "404 - Page Not Found",
        statusCode: 404,
        message: "Oops! The page you're looking for doesn't exist.",
        errors: {},
        values: {}
    });
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).render("error", {
        title: `${status} - Server Error`,
        statusCode: status, // Fixed: Use the actual error status
        message: "Something went wrong on our end. Please try again later.",
        errors: {},
        values: {}
    });
});

// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(()=>{
        console.log("Connected to MongoDB");
        app.listen(HTTP_PORT, onHttpStart);
    }).catch(err => {
        console.log("Can't connect to the MongoDB: " + err);
    });