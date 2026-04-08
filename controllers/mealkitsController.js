const express = require("express");
const router = express.Router();
const mealkitModel = require("../models/mealkitModel");
const mealkitUtil = require("../modules/mealkit-util");
const path = require("path");
const fs = require("fs");

const isClerk = (req, res, next) => {
    if (req.session.user && req.session.role === "clerk") {
        next();
    } else {
        res.status(403).render("error", {
            title: "403 - Forbidden",
            statusCode: 403,
            message: "You are not authorized to access this page."
        });
    }
};

// Accessible via /mealkits
router.get('/', (req, res) => {
    mealkitModel.find().lean() // found out that we can use .lean() when working with mongoose to return as a Plain Old JavaScript Object
    // reference : https://www.geeksforgeeks.org/mongodb/mongoose-query-prototype-lean-api/
    // nothing much, but I've played with it a little bit so might as well add it LOL, was too lazy to implement it on my previous mongoose operations tho :/
        .then((allMeals) => {
            const categorizedMeals = mealkitUtil.getMealKitsByCategory(allMeals);

            res.render("mealkits/on-the-menu", {
                allCategories: categorizedMeals, 
                title: "On The Menu"
            });
        })
        .catch((err) => {
            console.log("Error retrieving meal kits: " + err);
            res.status(500).render("error", {
                title: "Error",
                statusCode: 500,
                message: "We couldn't load the menu right now. Please try again later."
            });
        });
});

// GET /mealkits/list
router.get("/list", isClerk, (req, res) => {
    mealkitModel.find().sort({ title: 1 }).lean()
        .then((mealkits) => {
            res.render("mealkits/list", {
                title: "Meal Kit Inventory",
                mealkits: mealkits
            });
        })
        .catch(err => res.render("error", { 
    title: "Error",
    message: "Error loading list: " + err 
    }));
});

// GET /mealkits/add
router.get("/add", isClerk, (req, res) => {
    res.render("mealkits/add-form", { title: "Add Meal Kit" });
});


// POST /mealkits/add
router.post("/add", isClerk, (req, res) => {
    // Image Extension Validation
    if (req.files && req.files.imageUrl) {
        const image = req.files.imageUrl;
        const ext = path.parse(image.name).ext.toLowerCase();
        const validExtensions = [".jpg", ".jpeg", ".gif", ".png"];

        if (!validExtensions.includes(ext)) {
            return res.render("mealkits/add-form", { 
                title: "Add Meal Kit",
                error: "Invalid file type. Only jpg, jpeg, gif, and png are allowed.",
                kit: req.body 
            });
        }
    }

    const { title, includes, description, category, price, cookingTime, servings, featuredMealKit } = req.body;
    
    const newMealkit = new mealkitModel({
        title, includes, description, category, price, cookingTime, servings,
        featuredMealKit: featuredMealKit ? true : false,
        imageUrl: ""
    });

    newMealkit.save()
        .then((savedKit) => {
            if (req.files && req.files.imageUrl) {
                const image = req.files.imageUrl;
                const uniqueName = `mealkit-${savedKit._id}${path.parse(image.name).ext}`;
                
                image.mv(`public/images/${uniqueName}`)
                    .then(() => {
                        return mealkitModel.updateOne({ _id: savedKit._id }, { imageUrl: `/images/${uniqueName}` });
                    })
                    .then(() => res.redirect("/mealkits/list"));
            } else {
                res.redirect("/mealkits/list");
            }
        })
        .catch(err => {
            res.render("mealkits/add-form", { 
                title: "Add Meal Kit",
                error: "Database error: " + err.message,
                kit: req.body 
            });
        });
});

// GET /mealkits/edit/:id - Displays the edit form for a specific meal kit
router.get("/edit/:id", isClerk, (req, res) => {
    mealkitModel.findById(req.params.id).lean()
        .then((kit) => {
            if (kit) {
                res.render("mealkits/edit-form", { 
                    title: "Edit Meal Kit", 
                    kit: kit 
                });
            } else {
                res.status(404).render("error", { message: "Meal kit not found." });
            }
        })
        .catch(err => {
            console.log("Error finding kit for edit: " + err);
            res.status(500).render("error", { message: "Internal Server Error" });
        });
});

// POST /mealkits/edit/:id
router.post("/edit/:id", isClerk, (req, res) => {
    if (req.files && req.files.imageUrl) {
        const image = req.files.imageUrl;
        const ext = path.parse(image.name).ext.toLowerCase();
        const validExtensions = [".jpg", ".jpeg", ".gif", ".png"];

        if (!validExtensions.includes(ext)) {
            return mealkitModel.findById(req.params.id).lean()
                .then(kit => {
                    res.render("mealkits/edit-form", { 
                        title: "Edit Meal Kit",
                        error: "Invalid file type. Only jpg, jpeg, gif, and png are allowed.",
                        kit: { ...req.body, _id: req.params.id, imageUrl: kit.imageUrl } 
                    });
                });
        }
    }

    const { title, includes, description, category, price, cookingTime, servings, featuredMealKit } = req.body;
    
    let updateData = { 
        title, includes, description, category, price, cookingTime, servings,
        featuredMealKit: featuredMealKit ? true : false 
    };

    if (req.files && req.files.imageUrl) {
        const image = req.files.imageUrl;
        const uniqueName = `mealkit-${req.params.id}${path.parse(image.name).ext}`;
        
        // Find existing record to delete the old image file
        mealkitModel.findById(req.params.id)
            .then(kit => {
                // Save the new image
                return image.mv(`public/images/${uniqueName}`);
            })
            .then(() => {
                updateData.imageUrl = `/images/${uniqueName}`;
                return mealkitModel.updateOne({ _id: req.params.id }, { $set: updateData });
            })
            .then(() => res.redirect("/mealkits/list"))
            .catch(err => console.log("Error during image update: " + err));
    } else {
        mealkitModel.updateOne({ _id: req.params.id }, { $set: updateData })
            .then(() => res.redirect("/mealkits/list"))
            .catch(err => console.log("Error updating mealkit: " + err));
    }
});



// GET /mealkits/remove/:id (Confirmation)
router.get("/remove/:id", isClerk, (req, res) => {
    mealkitModel.findById(req.params.id).lean()
        .then((kit) => {
            res.render("mealkits/remove-confirm", { title: "Delete Confirmation", kit: kit });
        });
});

// POST /mealkits/remove/:id (Actual Delete)
router.post("/remove/:id", isClerk, (req, res) => {
    mealkitModel.findById(req.params.id)
        .then((kit) => {
            return mealkitModel.deleteOne({ _id: req.params.id });
        })
        .then(() => res.redirect("/mealkits/list"))
        .catch(err => console.log(err));
});

module.exports = router;