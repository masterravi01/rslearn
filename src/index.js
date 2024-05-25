import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
const port = process.env.PORT || 8000;

import connectDB from "./db/index.js";

connectDB()

// ; (async () => {
//   try {
//     // Ensure you have imported and configured mongoose and app before this block
//     const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);

//     // Error handling for the app
//     app.on('error', (error) => {
//       console.log("ERROR:", error);
//       throw error;
//     });


//     // Start the Express server
//     app.listen(port, () => {
//       console.log(`App listening on port ${port}`);
//     });

//   } catch (error) {
//     console.error('ERROR:', error);
//     throw error;
//   }
// })();






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
