import mongoose from "mongoose";
export const connectDB = () => {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
        console.log("Connected to the database.");
    })
        .catch((e) => {
        console.log("Connection failed.", e);
    });
};
//# sourceMappingURL=mongoose.js.map