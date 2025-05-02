import React, { createContext, useContext, useState, useEffect } from 'react';
import noteService from '../services/noteService';
import userService from '../services/userService';
import { useAuth } from './AuthContext';

const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'personal', or 'shared'
  const { user } = useAuth();

  // Fetch notes based on activeTab
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        // If user is not logged in, use local storage
        const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        setNotes(savedNotes);
        return;
      }
      
      setIsLoading(true);
      try {
        let fetchedNotes = [];
        
        switch (activeTab) {
          case 'personal':
            fetchedNotes = await noteService.getPersonalNotes();
            break;
          case 'shared':
            fetchedNotes = await noteService.getSharedNotes();
            break;
          default:
            fetchedNotes = await noteService.getAllNotes();
        }
        
        // Ensure we're setting an array
        setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        // Use local storage as fallback if API fails
        const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        setNotes(savedNotes);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [activeTab, user]);

  // Add a new note
  const addNote = async (note) => {
    try {
      setIsLoading(true);
      
      if (user) {
        // If user is authenticated, use API
        const newNote = await noteService.createNote({
          title: note.title,
          content: note.content
        });
        
        setNotes(prevNotes => [newNote, ...prevNotes]);
      } else {
        // Fallback to localStorage
        const newNote = {
          id: Date.now().toString(),
          title: note.title,
          content: note.content,
          date: new Date().toLocaleString()
        };
        
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing note
  const updateNote = async (updatedNote) => {
    try {
      setIsLoading(true);
      
      if (user) {
        // If user is authenticated, use API
        await noteService.updateNote(updatedNote.id, {
          title: updatedNote.title,
          content: updatedNote.content
        });
        
        // Refresh notes to get latest data
        let fetchedNotes;
        switch (activeTab) {
          case 'personal':
            fetchedNotes = await noteService.getPersonalNotes();
            break;
          case 'shared':
            fetchedNotes = await noteService.getSharedNotes();
            break;
          default:
            fetchedNotes = await noteService.getAllNotes();
        }
        setNotes(fetchedNotes);
      } else {
        // Fallback to localStorage
        const updatedNotes = notes.map(note => 
          note.id === updatedNote.id ? 
          {...note, title: updatedNote.title, content: updatedNote.content, date: new Date().toLocaleString()} : 
          note
        );
        
        setNotes(updatedNotes);
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
      }
      
      setActiveNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      setIsLoading(true);
      
      if (user) {
        // If user is authenticated, use API
        await noteService.deleteNote(id);
        
        // Remove from local state
        setNotes(notes.filter(note => note.id !== id));
      } else {
        // Fallback to localStorage
        const filteredNotes = notes.filter(note => note.id !== id);
        setNotes(filteredNotes);
        localStorage.setItem('notes', JSON.stringify(filteredNotes));
      }
      
      if (activeNote && activeNote.id === id) {
        setActiveNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sharing a note
  const shareNote = async (noteId, email) => {
    try {
      setIsLoading(true);
      
      // First, find the user by email
      const user = await userService.findUserByEmail(email);
      
      if (!user || !user.id) {
        throw new Error('User not found');
      }
      
      // Share the note using the API with the user's UUID
      await noteService.shareNote(noteId, user.id);
      
      // Refresh notes to reflect sharing changes
      let fetchedNotes;
      switch (activeTab) {
        case 'personal':
          fetchedNotes = await noteService.getPersonalNotes();
          break;
        case 'shared':
          fetchedNotes = await noteService.getSharedNotes();
          break;
        default:
          fetchedNotes = await noteService.getAllNotes();
      }
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error sharing note:', error);
      throw error; // Propagate error to handle in UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        activeNote,
        isLoading,
        activeTab,
        setActiveNote,
        setActiveTab,
        addNote,
        updateNote,
        deleteNote,
        shareNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export default NotesContext;