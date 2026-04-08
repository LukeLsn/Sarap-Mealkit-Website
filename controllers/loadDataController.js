const express = require("express");
const router = express.Router();
const mealkitModel = require("../models/mealkitModel");
const mealkitUtil = require("../modules/mealkit-util");

// Middleware to check for Clerk role
const isClerk = (req, res, next) => {
    if (req.session.user && req.session.role === "clerk") {
        next();
    } else {
        res.status(403).render("error", {
            title: "403 - Forbidden",
            statusCode: 403,
            message: "You are not authorized to add meal kits."
        });
    }
};

router.get("/mealkits", isClerk, (req, res) => {
    mealkitModel.countDocuments()
        .then(count => {
            if (count === 0) {
                // Get the array from the utility file
                const kitsToLoad = mealkitUtil.getAllMealKits();
                return mealkitModel.insertMany(kitsToLoad);
            } else {
                throw new Error("ALREADY_LOADED");
            }
        })
        .then(() => {
            res.render("error", {
                title: "Success",
                statusCode: 200,
                message: "Added meal kits to the database."
            });
        })
        .catch(err => {
            if (err.message === "ALREADY_LOADED") {
                res.render("error", {
                    title: "Action Not Required",
                    statusCode: 201,
                    message: "Meal kits have already been added to the database."
                });
            } else {
                res.status(500).render("error", {
                    title: "Error",
                    statusCode: 500,
                    message: "Internal Server Error: " + err.message
                });
            }
        });
});

module.exports = router;