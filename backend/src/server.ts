import "dotenv/config";
import express from 'express';
import { connectDB } from "./config/mongoose.js";
const app = express();
connectDB();

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(3000, () => {console.log("Server started at port 3000"); });