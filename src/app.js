import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middlewares.js";
import { morganMiddleware } from "./logger/morgan.logger.js";
import path from "path";

const app = express();

const corsOptions = {
  origin:
    process.env.CORS_ORIGIN === "*"
      ? "*" // This might give CORS error for some origins due to credentials set to true
      : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production.
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morganMiddleware);
// Create __dirname equivalent in ES module
import http from "http";
import { fileURLToPath } from "url"; // Import fileURLToPath for ES modules

const __filename = fileURLToPath(import.meta.url); // Get the current module's URL
const __dirname = path.dirname(__filename); // Get the directory name
//routes import
import indexRouter from "./routes/index.routes.js";

//routes declaration
app.use("/api/v1", indexRouter);
const distDir = path.join(__dirname, "dist", "hotelpro-frontend", "browser"); // Use the new __dirname
app.use(express.static(distDir));
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(distDir, "index.html"));
});
// Handling preflight requests
// preflight requests sent by the browser to determine whether the actual request (e.g., a GET or POST request) is safe to send.
app.options(
  "*",
  cors({
    origin: true,

    credentials: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "src", "views"));

app.use(errorHandler);

export { app };
