import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";

const port = process.env.PORT || 8000;

import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(port, () => {
      console.log(`App is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed !!!", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});
