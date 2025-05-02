import React, { useState, useEffect } from 'react';

function NoteForm({ onSubmit, activeNote, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Reset form or populate with activeNote data when activeNote changes
  useEffect(() => {
    if (activeNote) {
      console.log('Editing note:', activeNote);
      setTitle(activeNote.title || '');
      setContent(activeNote.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setError('');
  }, [activeNote]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (activeNote) {
      // For updating existing notes
      console.log('Submitting updated note:', {
        id: activeNote.id,
        title,
        content
      });
      
      if (!activeNote.id) {
        console.error('Attempting to update a note without an ID:', activeNote);
        setError('Cannot update note: Missing ID');
        return;
      }
      
      onSubmit({
        id: activeNote.id,
        title,
        content,
        is_archived: activeNote.is_archived || false,
        is_pinned: activeNote.is_pinned || false
      });
    } else {
      // For creating new notes
      console.log('Submitting new note:', {
        title,
        content
      });
      
      onSubmit({
        title,
        content,
        is_archived: false,
        is_pinned: false
      });
    }
    
    // Reset form
    setTitle('');
    setContent('');
    setError('');
  };

  return (
    <div className="note-form">
      <h2>{activeNote ? 'Edit Note' : 'Add New Note'}</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter note content"
            rows="6"
          ></textarea>
        </div>
        
        <div className="form-buttons">
          {activeNote && (
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-submit">
            {activeNote ? 'Update Note' : 'Add Note'}
            <i className={`fas ${activeNote ? 'fa-edit' : 'fa-plus'}`}></i>
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;