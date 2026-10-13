import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, login } from '../features/auth/authSlice';
import toast, { Toaster } from 'react-hot-toast';

export default function AuthForm() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth)

  const playSound = (type) => {
    const audio = new Audio(type === 'error' ? '/error.mp3' : '/success.mp3');
    audio.play();
  };
  useEffect(() => {
    if (error) {
      toast.error(error);
      playSound("error");
    }
  }, [error]);


  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const result = await dispatch(login({ email: form.email, password: form.password })).unwrap();
        toast.success('Logged in successfully!');
        console.log("hello----======")
        playSound('success');
      } else {
        const result = await dispatch(register(form)).unwrap();
        toast.success('Registered successfully!');
        playSound('success');
        setMode('login'); // switch to login after registration
      }
    } catch (err) {
      if (error) {
        toast.error(error || 'Something went wrong!');
        playSound('error');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        {mode === 'login' ? 'Login' : 'Register'}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className="w-full p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
        )}
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          type="email"
          className="w-full p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <input
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 transition"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button> */}
          <button
            type="submit"
            disabled={loading}
            className={`
        relative w-full sm:w-auto px-6 py-2
        font-semibold rounded-lg shadow-md
        overflow-hidden transition-all duration-300
        text-white
        ${loading
                ? "bg-indigo-400 cursor-wait"
                : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"
              }
      `}
          >
            {loading && (
              <span
                className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-400 
          animate-[shimmer_2s_infinite] bg-[length:200%_100%] opacity-60"
              />
            )}

            <span className="relative z-10">
              {loading ? "Processing..." : mode === "login" ? "Login" : "Register"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-gray-600 hover:text-indigo-500 transition"
          >
            Switch to {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
