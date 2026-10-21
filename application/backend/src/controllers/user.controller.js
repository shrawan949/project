import { usermodel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const generateAccessAndrefreshToken = async (userId) => {
    try {
        const user = await usermodel.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        console.error("Token generation error:", error);

        throw new ApiError(
            500,
            "Something went wrong while generating tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body ?? {};

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await usermodel.findOne({
        $or: [
            { username: normalizedUsername },
            { email: normalizedEmail }
        ]
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "User with the same username or email already exists"
        );
    }

    const createdUser = await usermodel.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password
    });

    const safeUser = await usermodel
        .findById(createdUser._id)
        .select("-password -refreshToken");

    if (!safeUser) {
        throw new ApiError(
            500,
            "Internal server error while retrieving the created user"
        );
    }

    return res.status(201).json(
        new apiResponse(201, safeUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ApiError(400, "Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await usermodel.findOne({
        email: normalizedEmail
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await user.isPasswordMatch(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndrefreshToken(user._id);

    const loggedInUser = await usermodel
        .findById(user._id)
        .select("-password -refreshToken");

    const cookieAge = Number(process.env.COOKIE_AGE);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        ...(Number.isFinite(cookieAge) && cookieAge > 0
            ? { maxAge: cookieAge }
            : {})
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new apiResponse(
                200,
                {
                    token: accessToken,
                    user: loggedInUser
                },
                "User login successful"
            )
        );
});

export { registerUser, loginUser };
