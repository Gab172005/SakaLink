import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt"; // used for security by hashing the password
const userSchema = new Schema({
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    userType: {
        type: String,
        enum: ['admin', 'customer'],
        default: "customer",
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // exclude the pw from the query for security stuff
    },
    cart: {
        type: Map,
        of: Number,
        default: {},
    },
}, { timestamps: true });
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export const User = mongoose.model("User", userSchema);
//# sourceMappingURL=user.model.js.map