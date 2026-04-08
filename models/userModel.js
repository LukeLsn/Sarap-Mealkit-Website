const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: {
        "type":String,
        "required": true
    },
    lastName: {
        "type":String,
       "required": true
    },
    email: {
        "type":String,
        "required": true,
        "unique":true
    },
    password: {
        "type":String,
       " required": true
    },
    profilePic: String,
    dateCreated: {
        "type" : Date,
        "default" : Date.now()
    }
});

// Hash passwords
// userSchema.pre("save", function(next){ // don't use arrow syntax
//     let user = this;

//     // Generate a unique salt.
//     bcryptjs.genSalt(10).then(salt => {
//         console.log("DEBUG - HASHING PASSWORD");
//         bcryptjs.hash(user.password, salt).then(hashedPwd =>{
//             user.password = hashedPwd;
//             next();
//         }).catch(err => {
//             console.log("Error occured while hashing...", err);
//         });
//     });

// });

// Convert above to async/await to check if it works because it doesn't even on the lecture code demo
// userSchema.pre("save", async function() { // "don't use arrow syntax"
//     if (this.isModified("password") || this.isNew) {
//         try {
//             console.log("LOG - Hashing password for:", this.email);
//             const salt = await bcryptjs.genSalt(15);
//             const hash = await bcryptjs.hash(this.password, salt);
            
//             this.password = hash;

//         } catch (err) {
//             console.log("Error occurred while hashing:", err);
//             throw err;
//         }
//     }
// });

// Hash passwords when a new user is added.
// copied from professor's Github code demos
userSchema.pre("save", async function() {
    // 'this' refers to the user document/model
    const user = this;

    if (!user.isModified('password')) {
        // Password hasn't changed, do not hash an already hased password.
        return; 
    }

    try {
        // The new mongoose detected the promise in our logic and didn't pass
        // in the next function. Instead, using await seems to do the trick.

        // Generate the salt.
        const salt = await bcryptjs.genSalt(10);
        
        // Set the password to the hashed version
        user.password = await bcryptjs.hash(user.password, salt);
    } 
    catch (err) {
        // If you throw an error, Mongoose catches it and sends it to the .save().catch().
        throw new Error(`Hashing failed: ${err.message}`);
    }
});



const userModel = mongoose.model("users", userSchema);

module.exports = userModel;