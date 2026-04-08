const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// schema made from attributes in mealkit-util.js
const mealkitSchema = new Schema({
    title: { type: String, required: true, unique: true },
    includes: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    cookingTime: { type: Number, required: true },
    servings: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
    featuredMealKit: { type: Boolean, default: false }
});


const Mealkit = mongoose.model("mealkits", mealkitSchema);
module.exports = Mealkit;