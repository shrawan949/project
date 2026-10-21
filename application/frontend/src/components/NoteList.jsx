import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes } from "../features/notes/notesSlice";
import NoteItem from "./NoteItem";
import NoteForm from "./NoteForm";

export default function NotesList() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes.items);
  const [editNote, setEditNote] = useState(null);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-2xl shadow-md sm:p-6">
        <h2 className="text-white text-lg font-bold mb-3">
          {editNote ? "Edit Note" : "Add New Note"}
        </h2>

        <NoteForm
          editNote={editNote}
          onDone={() => setEditNote(null)}
        />
      </div>

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
