import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteNote } from "../features/notes/notesSlice";

export default function NoteItem({ note, onEdit }) {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const isOwner = auth?.user?.id === note?.user;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        {/* Note Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-lg truncate">
            {note?.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 break-words">
            {note?.description}
          </p>
        </div>

        {/* Action Buttons (only for owner) */}
        {isOwner && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(note)}
              className="px-4 py-1.5 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 active:scale-95 transition"
            >
              Edit
            </button>
            <button
              onClick={() => dispatch(deleteNote(note._id))}
              className="px-4 py-1.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 active:scale-95 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
