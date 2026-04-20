import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI as string)  
    .then(() => {
      console.log("Connected to the database.");
    })
    .catch((e) => {
      console.log("Connection failed.", e);
    });
};