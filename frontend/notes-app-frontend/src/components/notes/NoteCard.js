import React, { useState } from 'react';
import ShareNote from '../modal/ShareNote';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNotes } from '../../contexts/NotesContext';
import './NoteCard.css';

function NoteCard({ note, onDelete, onEdit, onShare, isShared }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user } = useAuth();
  const { activeTab } = useNotes();

  // Function to truncate content if it's too long
  const truncateContent = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(note.id);
    setIsDeleteModalOpen(false);
  };

  const handleShare = (email) => {
    if (onShare) {
      onShare(note.id, email);
    }
    setIsShareModalOpen(false);
  };

  // Always show share icon in My Notes tab
  const shouldShowShareButton = () => {
    // Always show share icon on all notes in the My Notes tab
    if (activeTab === 'personal') {
      return true;
    }
    
    // For other tabs, check ownership
    if (!user) return false;
    
    // For notes from the API
    if (note.owner) {
      return note.owner.id === user.id;
    }
    
    // Fallback for localStorage notes (all owned by the current user)
    return true;
  };

  // Get the header/card title for display in the modal
  const getCardTitle = () => {
    const headerElement = document.querySelector(`[data-note-id="${note.id}"] .note-card-header h3`);
    if (headerElement) {
      return headerElement.textContent;
    }
    return note.title || 'this note';
  };

  return (
    <>
      <div className={`note-card ${isShared ? 'shared' : ''}`} data-note-id={note.id}>
        <div className="note-card-header">
          <h3>{note.title}</h3>
          <div className="note-card-actions">
            {shouldShowShareButton() && (
              <button 
                className="share-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                title="Share note"
              >
                <i className="fas fa-share-alt"></i>
              </button>
            )}
            <button 
              className="edit-btn" 
              onClick={() => onEdit(note)}
              title="Edit note"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="delete-btn" 
              onClick={handleDeleteClick}
              title="Delete note"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div className="note-content">
          {truncateContent(note.content)}
        </div>
        <div className="note-date">
          <i className="far fa-clock"></i> {note.date || (note.updated_at ? new Date(note.updated_at).toLocaleString() : 'Unknown date')}
        </div>
      </div>

      {/* Share Note Modal */}
      <ShareNote 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        noteId={note.id}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        noteTitle={note.title || "this note"}
      />
    </>
  );
}

export default NoteCard;