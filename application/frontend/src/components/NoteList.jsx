import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes, addNote, updateNote, deleteNote } from "../features/notes/notesSlice";
import NoteItem from "./NoteItem";
import NoteForm from "./NoteForm";
import io from "socket.io-client";
import toast from "react-hot-toast";

const socket = io(import.meta.env.VITE_API_Socket);

export default function NotesList() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes.items);
  const [editNote, setEditNote] = useState(null);
  useEffect(() => {
    dispatch(fetchNotes());

    socket.on("noteAdded", (note) => dispatch(addNote.fulfilled(note)));
    socket.on("noteUpdated", (note) => dispatch(updateNote.fulfilled(note)));
    socket.on("noteDeleted", (id) => dispatch(deleteNote.fulfilled(id)));

    return () => {
      socket.off("noteAdded");
      socket.off("noteUpdated");
      socket.off("noteDeleted");
    };
  }, [dispatch]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Form */}
      <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-2xl shadow-md sm:p-6">
        <h2 className="text-white text-lg font-bold mb-3">
          {editNote ? "Edit Note" : "Add New Note"}
        </h2>
        <NoteForm editNote={editNote} onDone={() => setEditNote(null)} />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No notes found. Add your first note!
          </p>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note._id}
              note={note}
              onEdit={() => setEditNote(note)}
            />
          ))
        )}
      </div>
    </div>
  );
}
