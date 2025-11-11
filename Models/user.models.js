const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let schema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phonenumber: { type: String, required: true },
        password: { type: String, required: true },
        isActive: { type: Boolean, default: false },  // ✅ Track active status
        lastActiveAt: { type: Date, default: null },  // ✅ Track last active date
        Balance: {
            type: Map, // Better than plain Object — more flexible for currencies
            of: Number,
            default: { NGN: 0, GBP: 0 },
        },

    },
    { timestamps: true } // 👈 Add this line
);




const saltRounds = 10;
schema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            const hashedPassword = await bcrypt.hash(this.password, saltRounds);
            this.password = hashedPassword;
            next();
            console.log("my password model", this.password);
            console.log("my password model", hashedPassword);

        } catch (err) {
            console.error("Error hashing password:", err);
            next(err);
        }
    } else {
        next();
    }
});


// Method to compare the entered password with the hashed password
schema.methods.compareUser = async function (userPass) {
    try {
        const user = await bcrypt.compare(userPass, this.password);  // Use lowercase 'password'
        return user;
    } catch (err) {
        console.log(err);
    }
};

const Userschema = mongoose.model("usercake", schema);
module.exports = { Userschema }