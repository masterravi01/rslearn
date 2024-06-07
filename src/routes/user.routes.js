import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/updateUserAvatar").post(verifyJWT, upload.single('avatar'), updateUserAvatar)

router.route("/updateUserCoverImage").post(verifyJWT, upload.single('coverImage'), updateUserCoverImage)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router