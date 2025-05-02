import React, { useState, useEffect } from 'react';
import { useNotes } from '../../contexts/NotesContext';

const ShareNote = ({ isOpen, onClose, noteId }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { shareNote } = useNotes();

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

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

  // Inline styles for modal backdrop and content
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          width: '90%',
          maxWidth: '450px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #4361ee, #7c3aed)',
            color: 'white',
            position: 'relative'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>Share Note</h2>
          <button 
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleShare}>
          <div style={{ padding: '28px' }}>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                backgroundColor: '#f9fafb',
                color: '#111827',
                fontSize: '1.1rem',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />
            
            {error && (
              <div style={{
                color: '#e74c3c',
                fontSize: '0.925rem',
                marginTop: '12px',
                padding: '12px 16px',
                background: 'rgba(231, 76, 60, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid rgba(231, 76, 60, 0.2)'
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{
                color: '#2ecc71',
                fontSize: '0.925rem',
                marginTop: '12px',
                padding: '12px 16px',
                background: 'rgba(46, 204, 113, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid rgba(46, 204, 113, 0.2)'
              }}>
                Note shared successfully!
              </div>
            )}
          </div>
          
          <div style={{
            padding: '20px 28px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            backgroundColor: '#f9fafb'
          }}>
            <button 
              type="button" 
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#6c757d'
              }}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '12px 32px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #4361ee, #7c3aed)',
                border: 'none',
                color: 'white',
                opacity: isLoading || !email.trim() ? '0.7' : '1',
                pointerEvents: isLoading || !email.trim() ? 'none' : 'auto'
              }}
              disabled={isLoading || !email.trim()}
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