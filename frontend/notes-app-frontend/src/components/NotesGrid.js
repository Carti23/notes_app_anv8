import React, { useState } from 'react';
import NoteCard from './NoteCard';
import './NoteCard.css';

const NotesGrid = ({ notes, onShare, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('my-notes');

  const tabs = [
    { id: 'all-notes', label: 'All Notes' },
    { id: 'my-notes', label: 'My Notes' },
    { id: 'shared', label: 'Shared With Me' },
  ];

  return (
    <div className="notes-container">
      <div className="notes-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="notes-grid">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            title={note.title}
            content={note.content}
            timestamp={note.timestamp}
            onShare={() => onShare(note.id)}
            onEdit={() => onEdit(note.id)}
            onDelete={() => onDelete(note.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesGrid; 