import React from 'react';
import NotesList from '../../components/notes/NotesList';
import NoteForm from '../../components/notes/NoteForm';
import { useNotes } from '../../contexts/NotesContext';
import NotesTabSelector from '../../components/notes/NotesTabSelector';
import './Home.css';

function Home() {
  const {
    notes,
    activeNote,
    isLoading,
    setActiveNote,
    addNote,
    updateNote,
    deleteNote,
    shareNote
  } = useNotes();

  return (
    <>
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>Your ideas, organized.</h1>
          <p>Keep your thoughts in one place, access them from anywhere.</p>
        </div>
      </header>
      
      <main className="App-main">
        <div className="App-container">
          <div className="notes-sidebar">
            <NoteForm 
              onSubmit={activeNote ? updateNote : addNote} 
              activeNote={activeNote}
              onCancel={() => setActiveNote(null)}
            />
          </div>
          
          <div className="notes-container">
            <NotesTabSelector />
            
            <NotesList 
              notes={notes} 
              onDelete={deleteNote} 
              onEdit={setActiveNote}
              onShare={shareNote}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;