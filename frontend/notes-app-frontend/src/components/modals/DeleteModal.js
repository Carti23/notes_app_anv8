import React, { useEffect, useRef } from 'react';
import './ImprovedDeleteModal.css';

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ImprovedDeleteModal({ isOpen, onClose, onDelete, itemName }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Focus trap inside modal
    const handleTab = (e) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element in modal
      setTimeout(() => {
        const deleteButton = modalRef.current.querySelector('.btn-delete');
        if (deleteButton) deleteButton.focus();
      }, 10);
      
      // Add animation class after a small delay to ensure it plays
      if (backdropRef.current) {
        backdropRef.current.classList.add('visible');
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onDelete();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="delete-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      ref={backdropRef}
    >
      <div 
        className="delete-modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="delete-modal-header">
          <div className="warning-icon">
            <WarningIcon />
          </div>
          <h2 id="delete-modal-title">Confirm Deletion</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="delete-modal-body">
          <p>Are you sure you want to delete "{itemName}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        
        <div className="delete-modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-delete" 
            onClick={handleConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImprovedDeleteModal;