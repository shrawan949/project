import{
    getAllNotes,
    addNotes,
    updateNotes,
    deleteNotes
}from "../controllers/note.controller.js"

import { Router } from "express";
import { verfyJWT } from "../middleware/auth.middleware.js"
import { errorHandler } from "../middleware/error.middleware.js";

const router = Router()

router.route('/').get(verfyJWT,getAllNotes)
router.route('/add').post(verfyJWT, addNotes)
router.route('/update/:id').put(verfyJWT, updateNotes)
router.route('/delete/:id').delete(verfyJWT, deleteNotes)
router.use(errorHandler); // Apply verifyJWT middleware to all routes in this file
export default router