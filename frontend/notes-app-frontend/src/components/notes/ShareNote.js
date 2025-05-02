import React, { useState } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import './ShareNoteModal.css';

const ShareNote = ({ isOpen, onClose, noteId }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { shareNote } = useNotes();

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await shareNote(noteId, email);
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      if (error.message === 'User not found') {
        setError('No user found with this email address');
      } else {
        setError('Failed to share note. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="share-modal">
        <div className="modal-header">
          <h2>Share Note</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleShare}>
          <div className="modal-content">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="email-input"
            />
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Note shared successfully!</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="share-button"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareNote; 