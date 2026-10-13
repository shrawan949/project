import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axiosInstance'

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
    const res = await API.get('/notes/');
    return res.data.data;
})

export const addNote = createAsyncThunk('notes/addNote', async (payload) => {
    const res = await API.post('/notes/add', payload);
    return res.data.data;
})

export const updateNote = createAsyncThunk('notes/updateNote', async ({ id, data }) => {
    const res = await API.put(`/notes/update/${id}`, data);
    return res.data.data;
})

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id) => {
    const res = await API.delete(`/notes/delete/${id}`);
    return { id: res.data.data._id };
})

const notesSlice = createSlice({
    name: 'notes',
    initialState: { items: [], status: 'idle' },
    reducers: {
        noteAddedRealtime(state, action) {
            const exists = state.items.find(n => n._id === action.payload._id);
            if (!exists) state.items.unshift(action.payload);
        },
        noteUpdatedRealtime(state, action) {
            state.items = state.items.map(n => n._id === action.payload._id ? action.payload : n);
        },
        noteDeletedRealtime(state, action) {
            state.items = state.items.filter(n => n._id !== action.payload.id);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(addNote.fulfilled, (state, action) => {
                const exists = state.items.find(n => n._id === action.payload._id);
                if (!exists) state.items.unshift(action.payload);
            })
            .addCase(updateNote.fulfilled, (state, action) => { state.items = state.items.map(n => n._id === action.payload._id ? action.payload : n); })
            .addCase(deleteNote.fulfilled, (state, action) => {
                const id=action.payload.id||action.payload
                state.items = state.items.filter(n => n._id !== id);
            })
    }
})

export const { noteAddedRealtime, noteUpdatedRealtime, noteDeletedRealtime } = notesSlice.actions;
export default notesSlice.reducer;
