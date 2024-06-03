import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../public/temp");
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname);
    },
});

export const upload = multer({ storage });

//http lec
// user-agent give us details about from where request is come like : safari,chrome,mobile , some this use case in some website popup comes like you should use are app instead web