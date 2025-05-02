import React from 'react';
import { useNotes } from '../../contexts/NotesContext';
import './NotesTabSelector.css';

function NotesTabSelector() {
  const { activeTab, setActiveTab } = useNotes();

  return (
    <div className="notes-tabs">
      <div 
        className={`notes-tab ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => setActiveTab('all')}
      >
        All Notes
      </div>
      <div 
        className={`notes-tab ${activeTab === 'personal' ? 'active' : ''}`}
        onClick={() => setActiveTab('personal')}
      >
        My Notes
      </div>
      <div 
        className={`notes-tab ${activeTab === 'shared' ? 'active' : ''}`}
        onClick={() => setActiveTab('shared')}
      >
        Shared With Me
      </div>
    </div>
  );
}

export default NotesTabSelector;