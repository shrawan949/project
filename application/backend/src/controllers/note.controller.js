import noteModel from "../models/note.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

let io; 

export const setSocket = (socketIo) => {
  io = socketIo;
};

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await noteModel.find();

  if (!notes || notes.length === 0) {
    throw new ApiError(404, "No notes found!");
  }

  res.status(200).json(new apiResponse(200, notes, "Fetched all notes"));
});

const addNotes = asyncHandler(async (req, res) => {
   const { title, description } = req.body;
    if(!title){
        throw new ApiError(402,"Title is required")
    }
    const note = await noteModel.create({ user:req.user._id, title, description });
     if(!note){
        throw new ApiError(500,"internal server error while create note")
    }
    io.emit("noteAdded", note); 
    res.status(200)
        .json(
            new apiResponse(200, note, "Add Note")
        )
})
const updateNotes = asyncHandler(async (req, res) => {
   const { id } = req.params;
    const { title, description } = req.body;
     if(!title){
        throw new ApiError(402,"Title is required")
    }
    const note = await noteModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
     if(!note){
        throw new ApiError(500,"internal server error while updating note")
    }
    io.emit("noteUpdated", note);
    res.status(200)
        .json(
            new apiResponse(200, note, "Update note")
        )
})
const deleteNotes = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const note= await noteModel.findByIdAndDelete(id);
    io.emit("noteDeleted", id); 
    res.status(200)
        .json(
            new apiResponse(200,note ,"Note deleted")
        )
})

export {getAllNotes,addNotes,updateNotes,deleteNotes}