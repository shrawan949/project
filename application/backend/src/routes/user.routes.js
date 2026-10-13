import {
    registerUser,
    loginUser,
} from "../controllers/user.controller.js"

import { Router } from "express";

import { errorHandler } from "../middleware/error.middleware.js";

const router = Router()


router.route('/register').post( registerUser)
router.route('/login').post(loginUser)

router.use(errorHandler); // Apply verifyJWT middleware to all routes in this file
export default router