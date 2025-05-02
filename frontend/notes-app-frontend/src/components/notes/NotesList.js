import React from 'react';
import NoteCard from './NoteCard';
import { useAuth } from '../../contexts/AuthContext';
import { useNotes } from '../../contexts/NotesContext';
import './NotesList.css';

function NotesList({ notes = [], onDelete, onEdit, onShare, isLoading }) {
  const { user } = useAuth();
  const { activeTab } = useNotes();
  
  // Ensure notes is an array before trying to use array methods
  const notesArray = Array.isArray(notes) ? notes : [];
  
  if (isLoading) {
    return (
      <div className="notes-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading notes...
      </div>
    );
  }
  
  if (notesArray.length === 0) {
    return (
      <div className="empty-notes">
        <h3>No notes yet</h3>
        <p>Add a new note to get started!</p>
      </div>
    );
  }

  // Determine if a note is owned by the current user or shared with them
  const isSharedNote = (note) => {
    if (!user) return false;
    
    // If the note has owner property (from API)
    if (note.owner) {
      return note.owner.id !== user.id;
    }
    
    // Fallback for localStorage notes which don't have owner property
    return false;
  };

  return (
    <div className="notes-list">
      {notesArray.map((note, index) => {
        const isShared = isSharedNote(note);
        
        return (
          <div 
            key={note.id} 
            className={`note-wrapper ${isShared ? 'shared' : ''}`}
            style={{ '--card-order': index }}
          >
            <NoteCard 
              note={note} 
              onDelete={onDelete} 
              onEdit={onEdit} 
              onShare={onShare}
              isShared={isShared}
            />
            
            {/* Only show "Shared by" in the Shared With Me tab */}
            {isShared && note.owner && activeTab === 'shared' && (
              <div className="shared-badge">
                <i className="fas fa-user-friends"></i> Shared by {note.owner.username}
              </div>
            )}
            
            {/* Show who the note is shared with in My Notes tab */}
            {activeTab === 'personal' && note.shared_with && note.shared_with.length > 0 && (
              <div className="shared-users">
                <small>Shared with:</small>
                {note.shared_with.map(user => (
                  <span key={user.id} className="shared-user">
                    <i className="fas fa-user"></i> {user.username}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default NotesList;