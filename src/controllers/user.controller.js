import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;
    if (
        [fullName, email, username, password].some((field) => {
            return field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All Fields are required")

    }
    const existingUser = await User.findOne({
        $or: [
            {
                email
            },
            {
                username
            }
        ]
    });
    if (existingUser) {
        throw new ApiError(409, "User Already Exists with this email & username !")
    }
    console.log(req.files?.avatar[0]?.path);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;
    if (avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!")

    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required!")

    }

    const user = await User.create({
        fullName,
        email,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (createdUser) {
        throw new ApiError(500, "Something went wrong while adding user !")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Register Successfully !")
    )
});
export {
    registerUser
}