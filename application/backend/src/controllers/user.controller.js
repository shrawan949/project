import { usermodel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const generateAccessAndrefreshToken = async (userId) => {
    try {
        const user = await usermodel.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Someting went wrong while generated access and refersh token", error)
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    const detailValid = [username, email, password].some(f => f?.trim() === "");
    if (detailValid) throw new ApiError(401, "All fields are required");

    // check if user exists
    const user = await usermodel.findOne({ $or: [{ username }, { email }] });
    if (user) throw new ApiError(400, "User with same username or email already exists!");

    const createUser = await usermodel.create({
        username: username.toLowerCase(),
        email,
        password
    });

    const isUserCreated = await usermodel.findById(createUser._id).select("-password -refreshToken");
    if (!isUserCreated) throw new ApiError(500, "Internal server error while creating new user");


    return res.status(200).json(
        new apiResponse(200, isUserCreated, "Register user successfully")
    )


})
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if ((!email)) {
        throw new ApiError(401, "email is required")
    }

    const user = await usermodel.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User not Found");
    }

    const vaild = await user.isPasswordMatch(password)

    if (!vaild) {
        throw new ApiError(404, "Wrong combination of email or password")
    }
    const { accessToken, refreshToken } = await generateAccessAndrefreshToken(user._id)
    const loggedInUser = await usermodel.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: Number(process.env.COOKIE_AGE)
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, { token:accessToken, user: { id: user._id, username: user.username, email: user.email } }, "User Login successfully"//message 
            ))

})
export { registerUser, loginUser }