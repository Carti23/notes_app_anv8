import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotesGrid from '../NotesGrid';

describe('NotesGrid', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Test Note 1',
      content: 'Content 1',
      timestamp: '2024-03-25T10:00:00Z'
    },
    {
      id: 2,
      title: 'Test Note 2',
      content: 'Content 2',
      timestamp: '2024-03-25T11:00:00Z'
    }
  ];

  const mockHandlers = {
    onShare: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tabs correctly', () => {
    render(<NotesGrid notes={mockNotes} {...mockHandlers} />);
    
    expect(screen.getByText('All Notes')).toBeInTheDocument();
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Shared With Me')).toBeInTheDocument();
  });

  it('renders notes correctly', () => {
    render(<NotesGrid notes={mockNotes} {...mockHandlers} />);
    
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
  });

  it('calls onShare when share button is clicked', () => {
    render(<NotesGrid notes={mockNotes} {...mockHandlers} />);
    
    const shareButtons = screen.getAllByRole('button', { name: /share/i });
    fireEvent.click(shareButtons[0]);
    
    expect(mockHandlers.onShare).toHaveBeenCalledWith(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<NotesGrid notes={mockNotes} {...mockHandlers} />);
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<NotesGrid notes={mockNotes} {...mockHandlers} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
  });

  it('changes active tab when clicked', () => {
    render(<NotesGrid notes={mockNotes} {...mockHandlers} />);
    
    const allNotesTab = screen.getByText('All Notes');
    fireEvent.click(allNotesTab);
    
    expect(allNotesTab).toHaveClass('active');
  });
}); 