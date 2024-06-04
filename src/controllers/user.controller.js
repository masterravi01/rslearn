import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Check if any required field is missing or empty
    if ([fullName, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All Fields are required");
    }

    // Check if the user already exists
    const existingUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });
    if (existingUser) {
        throw new ApiError(409, "User Already Exists with this email & username!");
    }

    // Access the uploaded files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    // Check if avatar is provided
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!");
    }

    // Upload the avatar and cover image to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverLocalPath ? await uploadOnCloudinary(coverLocalPath) : null;

    // Check if the avatar upload was successful
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed!");
    }

    // Create a new user
    const user = await User.create({
        fullName,
        email,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    });

    // Retrieve the created user without password and refreshToken fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // Check if user creation was successful
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while adding user!");
    }

    // Respond with the created user data
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully!")
    );
});

export {
    registerUser
};
