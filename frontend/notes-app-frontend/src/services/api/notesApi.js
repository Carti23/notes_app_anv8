import { API_BASE_URL } from '../../constants';

const NOTES_ENDPOINT = `${API_BASE_URL}/notes`;

export const notesApi = {
  getAllNotes: async () => {
    const response = await fetch(NOTES_ENDPOINT);
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  },

  getNoteById: async (id) => {
    const response = await fetch(`${NOTES_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch note');
    return response.json();
  },

  createNote: async (noteData) => {
    const response = await fetch(NOTES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Failed to create note');
    return response.json();
  },

  updateNote: async (id, noteData) => {
    const response = await fetch(`${NOTES_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Failed to update note');
    return response.json();
  },

  deleteNote: async (id) => {
    const response = await fetch(`${NOTES_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return response.json();
  },
}; 