import React, { useEffect, useRef, useState } from 'react';
import './ShareModal.css';

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.68439 10.6578L15.3125 7.34375M15.3156 16.6578L8.6938 13.3469M21 6C21 7.65685 19.6569 9 18 9C16.3431 9 15 7.65685 15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const ShareModal = ({ isOpen, onClose, onShare, noteName }) => {
  const [email, setEmail] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      inputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = () => {
    if (email) {
      onShare(email);
      setEmail('');
      onClose();
    }
  };

  return (
    <div 
      className="share-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        className="share-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-modal-header">
          <div className="share-modal-title">
            <ShareIcon />
            Share "{noteName}"
          </div>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="email-input-container">
          <span className="email-icon">
            <EmailIcon />
          </span>
          <input
            ref={inputRef}
            type="email"
            className="email-input"
            placeholder="Enter recipient's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email) handleShare();
            }}
            aria-label="Recipient's email address"
          />
        </div>

        <div className="share-modal-actions">
          <button 
            className="modal-button cancel-button" 
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="modal-button share-button" 
            onClick={handleShare}
            type="button"
            disabled={!email}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 