import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the path is correctly resolved
const uploadPath = path.resolve("public/temp");
// Ensure the directory exists
fs.mkdirSync(uploadPath, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });

//http lec
// user-agent give us details about from where request is come like : safari,chrome,mobile , some this use case in some website popup comes like you should use are app instead web
