import apiClient from './apiClient';

// Note service functions
const noteService = {
  // Get all notes (personal and shared)
  getAllNotes: async () => {
    try {
      const response = await apiClient.get('/api/v1/notes/');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch notes');
    }
  },

  // Get personal notes only
  getPersonalNotes: async () => {
    try {
      const response = await apiClient.get('/api/v1/notes/personal/');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch personal notes');
    }
  },

  // Get shared notes only
  getSharedNotes: async () => {
    try {
      const response = await apiClient.get('/api/v1/notes/shared/');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch shared notes');
    }
  },

  // Get a single note by ID
  getNote: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/notes/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch note');
    }
  },

  // Create a new note
  createNote: async (noteData) => {
    try {
      const response = await apiClient.post('/api/v1/notes/', noteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to create note');
    }
  },

  // Update an existing note
  updateNote: async (id, noteData) => {
    try {
      const response = await apiClient.put(`/api/v1/notes/${id}/`, noteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to update note');
    }
  },

  // Delete a note
  deleteNote: async (id) => {
    try {
      await apiClient.delete(`/api/v1/notes/${id}/`);
      return true;
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete note');
    }
  },

  // Share a note with a user
  shareNote: async (noteId, userId) => {
    try {
      const response = await apiClient.post(`/api/v1/notes/${noteId}/share/`, { user_id: userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to share note');
    }
  },

  // Unshare a note with a user
  unshareNote: async (noteId, userId) => {
    try {
      const response = await apiClient.post(`/api/v1/notes/${noteId}/unshare/`, { user_id: userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to unshare note');
    }
  },

  // Get note history
  getNoteHistory: async (noteId) => {
    try {
      const response = await apiClient.get(`/api/v1/notes/${noteId}/history/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch note history');
    }
  }
};

export default noteService;