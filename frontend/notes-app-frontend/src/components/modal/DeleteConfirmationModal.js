import React, { useEffect, useRef } from 'react';
import './DeleteConfirmationModal.css';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, noteTitle }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Separate backdrop and modal content without any class names
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
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          width: '90%',
          maxWidth: '360px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <h3 
          id="delete-modal-title"
          style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '1rem'
          }}
        >
          Confirm Deletion
        </h3>
        <p
          style={{
            color: '#555',
            fontSize: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          Are you sure you want to delete "{noteTitle}"?
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <button 
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              color: '#333',
              flex: '1',
              maxWidth: '120px'
            }}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button 
            style={{
              padding: '10px 15px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              flex: '1',
              backgroundColor: '#e74c3c',
              color: 'white',
              maxWidth: '120px'
            }}
            onClick={handleConfirm}
            type="button"
            autoFocus
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;