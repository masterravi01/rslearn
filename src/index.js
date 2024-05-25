import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
const port = process.env.PORT || 8000;

import connectDB from "./db/index.js";

connectDB()


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/rslearn", (req, res) => {
  res.send("<h1>Hello , Welcome to rs learn</h1>");
});

app.get("/gogi", (req, res) => {
  res.send("<h3>My name is master</h3>");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
