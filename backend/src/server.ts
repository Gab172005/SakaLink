console.log("MONGO URI:", process.env.MONGODB_URI);
console.log("RAW LENGTH:", process.env.MONGODB_URI?.length);
console.log("RAW VALUE:", process.env.MONGODB_URI);
import "dotenv/config";
import express from 'express';
import { connectDB } from "./config/mongoose.js";
const app = express();
connectDB();

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(3000, () => {console.log("Server started at port 3000"); });