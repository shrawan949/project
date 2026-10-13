import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AuthForm from './components/AuthForm'
import NotesList from './components/NoteList'
import { logout } from './features/auth/authSlice'
import toast, { Toaster } from 'react-hot-toast'

export default function App() {
  const auth = useSelector(s => s.auth);
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            fontWeight: "500",
          },
          duration: 3000,
        }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">Mini Notes</h1>
          {auth.user ? (
            <div className="flex items-center gap-4">

              <div className="text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-full shadow hover:shadow-lg transition flex items-center gap-2 ">
                Welcome, <span className="font-semibold">{auth.user.username}</span>
              </div>

              <button
                onClick={() => {dispatch(logout());toast.success('Logged out successfully!');}}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 active:scale-95 transition"
              >
                Logout
              </button>
            </div>

          ) : null}
        </header>


        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
          {!auth.user ? (
            <>
              <AuthForm />
              <div className="mt-6 text-center text-gray-400 text-sm">
                Developed by <span className="font-semibold">Harsh shahu</span>
              </div></>
          ) : (
            <NotesList />
          )}

        </div>

      </div>
    </div>

  )
}
