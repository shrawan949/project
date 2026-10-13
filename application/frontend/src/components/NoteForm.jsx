import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addNote, updateNote } from '../features/notes/notesSlice'

export default function NoteForm({ editNote, onDone }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();

  useEffect(()=>{
    if (editNote) { setTitle(editNote.title); setDescription(editNote.description); }
  },[editNote])

  const submit = async (e) => {
    e.preventDefault();
    if (editNote) {
      await dispatch(updateNote({ id: editNote._id, data: { title, description } }));
      onDone && onDone();
    setTitle(''); setDescription('');
    } else {
      await dispatch(addNote({ title, description }));
      setTitle(''); setDescription('');
    }
  }

  return (
    <form
  onSubmit={submit}
  className="p-6 bg-white rounded-2xl shadow-lg space-y-4 transition-all duration-300 hover:shadow-2xl"
>
  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Title"
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    required
  />

  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Description"
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none h-24"
    required
  />

  <div className="flex justify-end">
    <button
      type="submit"
      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow hover:from-green-600 hover:to-green-700 transition transform hover:-translate-y-0.5"
    >
      {editNote ? 'Update Note' : 'Add Note'}
    </button>
  </div>
</form>

  )
}
