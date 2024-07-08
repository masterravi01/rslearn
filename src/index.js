import "./config.js";
import { app } from "./app.js";

const port = process.env.PORT || 8000;

import connectDB from "./db/index.js";
import { logger } from "./logger/winston.logger.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      logger.error("ERROR:", error);
      throw error;
    });
    app.listen(port, () => {
      logger.info(`App is listening on port ${port}`);
    });
  })
  .catch((err) => {
    logger.error("mongodb connection failed !!!", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});
